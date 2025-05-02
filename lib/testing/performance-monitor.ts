import { puppeteerService } from "@/lib/utils/puppeteer-utils"
import type { Page } from "puppeteer"

interface PerformanceMetrics {
  url: string
  loadTime: number
  firstPaint: number
  firstContentfulPaint: number
  domContentLoaded: number
  largestContentfulPaint?: number
  totalBlockingTime?: number
  cumulativeLayoutShift?: number
  speedIndex?: number
  resourceCount: number
  resourceSize: number
  jsHeapSize: number
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  /**
   * Measure performance metrics for a page
   */
  async measurePagePerformance(url: string): Promise<PerformanceMetrics> {
    const page = await puppeteerService.newPage()

    try {
      // Enable CDP sessions to gather performance metrics
      const client = await page.target().createCDPSession()
      await client.send("Performance.enable")

      // Start tracing
      await page.tracing.start({ path: "", categories: ["devtools.timeline"] })

      // Navigate to the page and wait for network idle
      const navigationStart = Date.now()
      await page.goto(url, { waitUntil: "networkidle0" })
      const loadTime = Date.now() - navigationStart

      // Collect performance metrics
      const performanceMetrics = await client.send("Performance.getMetrics")
      const metrics = performanceMetrics.metrics.reduce((acc: Record<string, number>, metric: any) => {
        acc[metric.name] = metric.value
        return acc
      }, {})

      // Get resource timing information
      const resourceTimings = await page.evaluate(() => JSON.stringify(window.performance.getEntriesByType("resource")))
      const resources = JSON.parse(resourceTimings)

      // Calculate resource stats
      const resourceCount = resources.length
      const resourceSize = resources.reduce((total: number, resource: any) => total + (resource.transferSize || 0), 0)

      // Get paint timing information
      const paintTimings = await page.evaluate(() => JSON.stringify(window.performance.getEntriesByType("paint")))
      const paints = JSON.parse(paintTimings)

      const firstPaint = paints.find((p: any) => p.name === "first-paint")?.startTime || 0
      const firstContentfulPaint = paints.find((p: any) => p.name === "first-contentful-paint")?.startTime || 0

      // Get DOM content loaded time
      const domContentLoaded = await page.evaluate(
        () => window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart,
      )

      // Get Web Vitals if available
      const webVitals = await page.evaluate(() => {
        return {
          lcp: (window as any).LCP?.value,
          tbt: (window as any).TBT?.value,
          cls: (window as any).CLS?.value,
          si: (window as any).SI?.value,
        }
      })

      // Stop tracing
      await page.tracing.stop()

      return {
        url,
        loadTime,
        firstPaint,
        firstContentfulPaint,
        domContentLoaded,
        largestContentfulPaint: webVitals.lcp,
        totalBlockingTime: webVitals.tbt,
        cumulativeLayoutShift: webVitals.cls,
        speedIndex: webVitals.si,
        resourceCount,
        resourceSize,
        jsHeapSize: metrics.JSHeapUsedSize || 0,
      }
    } finally {
      await page.close()
    }
  }

  /**
   * Measure performance for multiple pages
   */
  async measureSitePerformance(urls: string[]): Promise<Record<string, PerformanceMetrics>> {
    const results: Record<string, PerformanceMetrics> = {}

    for (const url of urls) {
      try {
        results[url] = await this.measurePagePerformance(url)
      } catch (error) {
        console.error(`Error measuring performance for ${url}:`, error)
      }
    }

    await puppeteerService.closeBrowser()
    return results
  }

  /**
   * Inject Web Vitals measurement script into a page
   */
  async injectWebVitalsScript(page: Page): Promise<void> {
    await page.addScriptTag({
      url: "https://unpkg.com/web-vitals/dist/web-vitals.iife.js",
    })

    await page.evaluate(() => {
      const webVitals = (window as any).webVitals

      // Store the metrics on the window object
      ;(window as any).LCP = { value: 0 }
      ;(window as any).FID = { value: 0 }
      ;(window as any).CLS = { value: 0 }
      ;(window as any).FCP = { value: 0 }
      ;(window as any).TTFB = { value: 0 }

      // Measure and store each metric
      webVitals.getLCP((metric: any) => {
        ;(window as any).LCP.value = metric.value
      })
      webVitals.getFID((metric: any) => {
        ;(window as any).FID.value = metric.value
      })
      webVitals.getCLS((metric: any) => {
        ;(window as any).CLS.value = metric.value
      })
      webVitals.getFCP((metric: any) => {
        ;(window as any).FCP.value = metric.value
      })
      webVitals.getTTFB((metric: any) => {
        ;(window as any).TTFB.value = metric.value
      })
    })
  }
}

// Export a singleton instance
export const performanceMonitor = new PerformanceMonitor()

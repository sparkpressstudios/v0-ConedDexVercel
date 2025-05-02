import type { Browser, Page } from "puppeteer"

/**
 * Puppeteer utility class for browser automation tasks
 */
export class PuppeteerService {
  private browser: Browser | null = null
  // Add a cleanup timeout to ensure browser is always closed
  private browserCleanupTimeout: NodeJS.Timeout | null = null

  // Set a maximum browser lifetime to prevent memory leaks
  private readonly MAX_BROWSER_LIFETIME = 30 * 60 * 1000 // 30 minutes

  /**
   * Initialize the browser instance
   */
  async initBrowser(): Promise<void> {
    if (this.browser) {
      return
    }

    try {
      // Import puppeteer dynamically to avoid server-side issues
      const puppeteer = await import("puppeteer")

      this.browser = await puppeteer.default.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      })

      // Set a timeout to ensure browser is closed even if not explicitly called
      this.browserCleanupTimeout = setTimeout(() => {
        console.warn("Forcing browser cleanup after maximum lifetime")
        this.closeBrowser()
      }, this.MAX_BROWSER_LIFETIME)

      // Add event listener for browser disconnection
      this.browser.on("disconnected", () => {
        console.log("Browser disconnected")
        this.browser = null
        this.clearCleanupTimeout()
      })
    } catch (error) {
      console.error("Error initializing browser:", error)
      throw error
    }
  }

  /**
   * Close the browser instance and clean up resources
   */
  async closeBrowser(): Promise<void> {
    this.clearCleanupTimeout()

    if (this.browser) {
      try {
        const pages = await this.browser.pages()

        // Close all open pages first
        for (const page of pages) {
          try {
            await page.close()
          } catch (error) {
            console.warn("Error closing page:", error)
          }
        }

        // Then close the browser
        await this.browser.close()
        console.log("Browser closed successfully")
      } catch (error) {
        console.error("Error closing browser:", error)
      } finally {
        this.browser = null
      }
    }
  }

  /**
   * Clear the browser cleanup timeout
   */
  private clearCleanupTimeout(): void {
    if (this.browserCleanupTimeout) {
      clearTimeout(this.browserCleanupTimeout)
      this.browserCleanupTimeout = null
    }
  }

  /**
   * Initialize a browser instance
   */
  // async initBrowser(headless = true): Promise<Browser> {
  //   if (!this.browser) {
  //     this.browser = await puppeteer.launch({
  //       headless: headless ? "new" : false,
  //       args: ["--no-sandbox", "--disable-setuid-sandbox"],
  //     })
  //   }
  //   return this.browser
  // }

  /**
   * Close the browser instance
   */
  // async closeBrowser(): Promise<void> {
  //   if (this.browser) {
  //     await this.browser.close()
  //     this.browser = null
  //   }
  // }

  /**
   * Create a new page
   */
  async newPage(): Promise<Page> {
    await this.initBrowser()
    return await this.browser.newPage()
  }

  /**
   * Take a screenshot of a URL
   */
  async takeScreenshot(
    url: string,
    outputPath: string,
    options: {
      width?: number
      height?: number
      fullPage?: boolean
      waitForSelector?: string
    } = {},
  ): Promise<Buffer> {
    const page = await this.newPage()

    // Set viewport if dimensions provided
    if (options.width && options.height) {
      await page.setViewport({ width: options.width, height: options.height })
    }

    await page.goto(url, { waitUntil: "networkidle2" })

    // Wait for specific element if selector provided
    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector)
    }

    // Take screenshot
    const screenshot = await page.screenshot({
      path: outputPath,
      fullPage: options.fullPage || false,
    })

    return screenshot
  }

  /**
   * Generate a PDF from a URL
   */
  async generatePDF(
    url: string,
    outputPath: string,
    options: {
      format?: "Letter" | "Legal" | "Tabloid" | "A0" | "A1" | "A2" | "A3" | "A4" | "A5" | "A6"
      landscape?: boolean
      printBackground?: boolean
      waitForSelector?: string
    } = {},
  ): Promise<Buffer> {
    const page = await this.newPage()

    await page.goto(url, { waitUntil: "networkidle2" })

    // Wait for specific element if selector provided
    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector)
    }

    // Generate PDF
    const pdf = await page.pdf({
      path: outputPath,
      format: options.format || "A4",
      landscape: options.landscape || false,
      printBackground: options.printBackground || true,
    })

    return pdf
  }

  /**
   * Scrape data from a webpage
   */
  async scrapeData<T>(url: string, scrapeFunction: (page: Page) => Promise<T>): Promise<T> {
    const page = await this.newPage()
    await page.goto(url, { waitUntil: "networkidle2" })

    const data = await scrapeFunction(page)

    return data
  }

  /**
   * Run automated tests on a webpage
   */
  async runTests(url: string, testFunction: (page: Page) => Promise<void>): Promise<void> {
    const page = await this.newPage()
    await page.goto(url, { waitUntil: "networkidle2" })

    await testFunction(page)
  }
}

// Export a singleton instance
export const puppeteerService = new PuppeteerService()

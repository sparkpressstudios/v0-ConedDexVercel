import fs from "fs/promises"
import path from "path"
import { PNG } from "pngjs"
import pixelmatch from "pixelmatch"
import { puppeteerService } from "@/lib/utils/puppeteer-utils"

interface ScreenshotOptions {
  width?: number
  height?: number
  fullPage?: boolean
  waitForSelector?: string
}

interface ComparisonResult {
  diffPercentage: number
  diffImagePath: string | null
  match: boolean
  baselineExists: boolean
}

/**
 * Visual regression testing utility
 */
export class VisualRegressionTester {
  private baselineDir: string
  private currentDir: string
  private diffDir: string
  private threshold: number

  constructor(options?: { threshold?: number }) {
    // Set up directories
    this.baselineDir = path.join(process.cwd(), "public", "visual-testing", "baseline")
    this.currentDir = path.join(process.cwd(), "public", "visual-testing", "current")
    this.diffDir = path.join(process.cwd(), "public", "visual-testing", "diff")
    this.threshold = options?.threshold || 0.1 // Default 10% threshold
  }

  /**
   * Initialize directories
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.baselineDir, { recursive: true })
    await fs.mkdir(this.currentDir, { recursive: true })
    await fs.mkdir(this.diffDir, { recursive: true })
  }

  /**
   * Take a screenshot of a page
   */
  async takeScreenshot(
    url: string,
    name: string,
    options: ScreenshotOptions = {},
  ): Promise<{ path: string; buffer: Buffer }> {
    const screenshotPath = path.join(this.currentDir, `${name}.png`)
    const buffer = await puppeteerService.takeScreenshot(url, screenshotPath, options)
    return { path: screenshotPath, buffer }
  }

  /**
   * Compare current screenshot with baseline
   */
  async compareWithBaseline(name: string): Promise<ComparisonResult> {
    const baselinePath = path.join(this.baselineDir, `${name}.png`)
    const currentPath = path.join(this.currentDir, `${name}.png`)
    const diffPath = path.join(this.diffDir, `${name}.png`)

    // Check if baseline exists
    try {
      await fs.access(baselinePath)
    } catch (error) {
      // If baseline doesn't exist, copy current as baseline
      await fs.copyFile(currentPath, baselinePath)
      return {
        diffPercentage: 0,
        diffImagePath: null,
        match: true,
        baselineExists: false,
      }
    }

    // Read images
    const baselineImg = PNG.sync.read(await fs.readFile(baselinePath))
    const currentImg = PNG.sync.read(await fs.readFile(currentPath))

    // Check dimensions
    if (baselineImg.width !== currentImg.width || baselineImg.height !== currentImg.height) {
      // If dimensions don't match, create a simple diff image
      await fs.copyFile(currentPath, diffPath)
      return {
        diffPercentage: 1, // 100% different
        diffImagePath: diffPath,
        match: false,
        baselineExists: true,
      }
    }

    // Create diff image
    const { width, height } = baselineImg
    const diffImg = new PNG({ width, height })

    // Compare images
    const numDiffPixels = pixelmatch(baselineImg.data, currentImg.data, diffImg.data, width, height, {
      threshold: this.threshold,
    })

    // Calculate diff percentage
    const diffPercentage = numDiffPixels / (width * height)

    // Write diff image
    await fs.writeFile(diffPath, PNG.sync.write(diffImg))

    return {
      diffPercentage,
      diffImagePath: diffPath,
      match: diffPercentage < this.threshold,
      baselineExists: true,
    }
  }

  /**
   * Update baseline with current screenshot
   */
  async updateBaseline(name: string): Promise<void> {
    const baselinePath = path.join(this.baselineDir, `${name}.png`)
    const currentPath = path.join(this.currentDir, `${name}.png`)
    await fs.copyFile(currentPath, baselinePath)
  }

  /**
   * Run visual regression tests for multiple pages
   */
  async runVisualTests(
    pages: Array<{ name: string; url: string; options?: ScreenshotOptions }>,
  ): Promise<Record<string, ComparisonResult>> {
    await this.initialize()

    const results: Record<string, ComparisonResult> = {}

    for (const page of pages) {
      try {
        // Take screenshot
        await this.takeScreenshot(page.url, page.name, page.options)

        // Compare with baseline
        results[page.name] = await this.compareWithBaseline(page.name)
      } catch (error) {
        console.error(`Error testing ${page.name}:`, error)
        results[page.name] = {
          diffPercentage: 1,
          diffImagePath: null,
          match: false,
          baselineExists: false,
        }
      }
    }

    return results
  }
}

// Export a singleton instance
export const visualRegressionTester = new VisualRegressionTester()

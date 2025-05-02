import { puppeteerService } from "./puppeteer-utils"
import type { Page } from "puppeteer"
import fs from "fs/promises"
import path from "path"

interface BatchProcessingOptions {
  batchSize?: number
  concurrency?: number
  timeout?: number
  logProgress?: boolean
  maxRetries?: number
  retryDelay?: number
}

interface BatchProcessingResult<T> {
  processed: number
  failed: number
  results: T[]
  errors: Array<{ item: any; error: string }>
  retried?: number
}

/**
 * Batch processor utility for handling large datasets
 */
export class BatchProcessor {
  /**
   * Process data in batches with retry capability
   */
  async processBatch<T, R>(
    items: T[],
    processor: (batch: T[], options?: any) => Promise<R[]>,
    options: BatchProcessingOptions = {},
  ): Promise<BatchProcessingResult<R>> {
    const {
      batchSize = 50,
      concurrency = 1,
      timeout = 30000,
      logProgress = true,
      maxRetries = 3,
      retryDelay = 1000,
    } = options

    const results: R[] = []
    const errors: Array<{ item: T; error: string }> = []
    let processed = 0
    let retried = 0

    // Split items into batches
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }

    if (logProgress) {
      console.log(`Processing ${items.length} items in ${batches.length} batches of ${batchSize}`)
    }

    // Process batches with limited concurrency
    for (let i = 0; i < batches.length; i += concurrency) {
      const batchPromises = batches.slice(i, i + concurrency).map(async (batch, index) => {
        const batchNumber = i + index + 1
        let retryCount = 0

        while (retryCount <= maxRetries) {
          try {
            if (logProgress) {
              console.log(
                `Processing batch ${batchNumber}/${batches.length}${
                  retryCount > 0 ? ` (retry ${retryCount}/${maxRetries})` : ""
                }`,
              )
            }

            // Add timeout to each batch
            const timeoutPromise = new Promise<R[]>((_, reject) => {
              setTimeout(() => reject(new Error(`Batch ${batchNumber} timed out after ${timeout}ms`)), timeout)
            })

            // Process the batch
            const batchResults = await Promise.race([processor(batch, options), timeoutPromise])
            processed += batch.length

            if (logProgress) {
              console.log(`Completed batch ${batchNumber}/${batches.length}`)
            }

            return batchResults
          } catch (error) {
            retryCount++
            retried++

            if (retryCount <= maxRetries) {
              console.warn(`Batch ${batchNumber} failed, retrying (${retryCount}/${maxRetries})...`, error)
              // Wait before retrying
              await new Promise((resolve) => setTimeout(resolve, retryDelay * retryCount))
            } else {
              console.error(`Batch ${batchNumber} failed after ${maxRetries} retries:`, error)

              // Add all items in the batch to errors
              batch.forEach((item) => {
                errors.push({
                  item,
                  error: error instanceof Error ? error.message : "Unknown error",
                })
              })

              return [] as R[]
            }
          }
        }

        return [] as R[] // This should never be reached due to the while loop
      })

      // Wait for the current set of batches to complete
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults.flat())
    }

    return {
      processed,
      failed: errors.length,
      retried,
      results,
      errors,
    }
  }

  /**
   * Process web pages in batches using Puppeteer
   */
  async processWebPages<T>(
    urls: string[],
    processor: (page: Page, url: string, index: number) => Promise<T>,
    options: BatchProcessingOptions = {},
  ): Promise<BatchProcessingResult<T>> {
    const { batchSize = 10, concurrency = 3, logProgress = true } = options

    // Initialize browser once for all batches
    await puppeteerService.initBrowser()

    try {
      const batchProcessor = async (urlBatch: string[]): Promise<T[]> => {
        const results: T[] = []

        // Process each URL in the batch sequentially
        for (let i = 0; i < urlBatch.length; i++) {
          const url = urlBatch[i]
          const page = await puppeteerService.newPage()

          try {
            const result = await processor(page, url, i)
            results.push(result)
          } catch (error) {
            console.error(`Error processing ${url}:`, error)
            throw error
          } finally {
            await page.close()
          }
        }

        return results
      }

      return await this.processBatch(urls, batchProcessor, {
        batchSize,
        concurrency,
        logProgress,
      })
    } finally {
      await puppeteerService.closeBrowser()
    }
  }

  /**
   * Export batch processing results to a file
   */
  async exportResults(results: any, outputPath: string): Promise<string> {
    const dir = path.dirname(outputPath)
    await fs.mkdir(dir, { recursive: true })

    await fs.writeFile(outputPath, JSON.stringify(results, null, 2))

    return outputPath
  }

  /**
   * Import data from a file for batch processing
   */
  async importData<T>(filePath: string): Promise<T[]> {
    const data = await fs.readFile(filePath, "utf-8")
    return JSON.parse(data) as T[]
  }
}

// Export a singleton instance
export const batchProcessor = new BatchProcessor()

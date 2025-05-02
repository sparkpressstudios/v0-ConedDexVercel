import { NextResponse } from "next/server"
import { batchProcessor } from "@/lib/utils/batch-processor"
import type { Page } from "puppeteer"

export async function POST(request: Request) {
  try {
    const { data, type, options } = await request.json()

    if (!data || !type) {
      return NextResponse.json({ error: "Data and type are required" }, { status: 400 })
    }

    let results

    if (type === "urls") {
      // Process URLs using Puppeteer
      results = await processUrls(data, options)
    } else {
      // Process generic data
      results = await processData(data, options)
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error in batch processing:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process batch" },
      { status: 500 },
    )
  }
}

async function processUrls(urls: string[], options: any) {
  // Define the processor function for web pages
  const pageProcessor = async (page: Page, url: string): Promise<any> => {
    await page.goto(url, { waitUntil: "networkidle2", timeout: options.timeout })

    // Extract basic information from the page
    const data = await page.evaluate(() => {
      return {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute("content") || null,
        h1: Array.from(document.querySelectorAll("h1")).map((el) => el.textContent?.trim()),
        links: Array.from(document.querySelectorAll("a[href]")).map((el) => ({
          text: el.textContent?.trim(),
          href: el.getAttribute("href"),
        })),
        images: Array.from(document.querySelectorAll("img")).map((el) => ({
          alt: el.getAttribute("alt"),
          src: el.getAttribute("src"),
        })),
      }
    })

    return {
      url,
      data,
      timestamp: new Date().toISOString(),
    }
  }

  // Process the URLs in batches
  const result = await batchProcessor.processWebPages(urls, pageProcessor, {
    batchSize: options.batchSize || 10,
    concurrency: options.concurrency || 3,
    timeout: options.timeout || 30000,
  })

  return {
    processed: urls.length,
    failed: result.errors.length,
    results: result.results,
    errors: result.errors,
  }
}

async function processData(data: any[], options: any) {
  // Define a generic processor function
  const dataProcessor = async (batch: any[]): Promise<any[]> => {
    // This is a simple example that just adds a processed flag
    // In a real implementation, this would do actual processing
    return batch.map((item) => ({
      ...item,
      processed: true,
      timestamp: new Date().toISOString(),
    }))
  }

  // Process the data in batches
  const result = await batchProcessor.processBatch(data, dataProcessor, {
    batchSize: options.batchSize || 50,
    concurrency: options.concurrency || 3,
    timeout: options.timeout || 30000,
  })

  return {
    processed: data.length,
    failed: result.errors.length,
    results: result.results,
    errors: result.errors,
  }
}

import { NextResponse } from "next/server"
import { scrapeIceCreamShops } from "@/lib/utils/web-scraper"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const shops = await scrapeIceCreamShops(url)

    return NextResponse.json({ shops })
  } catch (error) {
    console.error("Error scraping shops:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to scrape shops" },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { performanceMonitor } from "@/lib/testing/performance-monitor"

export async function POST(request: Request) {
  try {
    const { urls } = await request.json()

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "Valid URLs array is required" }, { status: 400 })
    }

    const results = await performanceMonitor.measureSitePerformance(urls)

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("Error measuring performance:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to measure performance" },
      { status: 500 },
    )
  }
}

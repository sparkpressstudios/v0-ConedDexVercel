import { NextResponse } from "next/server"
import { chartExporter } from "@/lib/utils/chart-exporter"
import path from "path"
import fs from "fs/promises"

export async function POST(request: Request) {
  try {
    const { charts } = await request.json()

    if (!charts || !Array.isArray(charts) || charts.length === 0) {
      return NextResponse.json({ error: "Valid charts array is required" }, { status: 400 })
    }

    // Create output directory
    const outputDir = path.join(process.cwd(), "public", "charts")
    await fs.mkdir(outputDir, { recursive: true })

    // Process each chart
    const processedCharts = charts.map((chart) => ({
      data: chart.data,
      outputPath: path.join(outputDir, `chart-${Date.now()}-${Math.random().toString(36).substring(2, 10)}.png`),
      options: chart.options,
    }))

    const results = await chartExporter.exportCharts(processedCharts)

    // Convert file paths to public URLs
    const urls = results.map((filePath) => {
      const relativePath = filePath.split("public")[1]
      return relativePath
    })

    return NextResponse.json({
      success: true,
      urls,
    })
  } catch (error) {
    console.error("Error exporting charts:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export charts" },
      { status: 500 },
    )
  }
}

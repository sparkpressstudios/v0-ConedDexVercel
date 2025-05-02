import { NextResponse } from "next/server"
import { visualRegressionTester } from "@/lib/testing/visual-regression"

export async function POST(request: Request) {
  try {
    const { pages } = await request.json()

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: "Valid pages array is required" }, { status: 400 })
    }

    const results = await visualRegressionTester.runVisualTests(pages)

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: Object.keys(results).length,
        passed: Object.values(results).filter((result) => result.match).length,
        failed: Object.values(results).filter((result) => !result.match).length,
        newBaselines: Object.values(results).filter((result) => !result.baselineExists).length,
      },
    })
  } catch (error) {
    console.error("Error running visual regression tests:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to run visual regression tests" },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Screenshot name is required" }, { status: 400 })
    }

    await visualRegressionTester.updateBaseline(name)

    return NextResponse.json({
      success: true,
      message: `Baseline updated for ${name}`,
    })
  } catch (error) {
    console.error("Error updating baseline:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update baseline" },
      { status: 500 },
    )
  }
}

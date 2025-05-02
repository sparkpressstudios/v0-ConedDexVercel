import { NextResponse } from "next/server"
import { runUiTests } from "@/lib/testing/puppeteer-tests"
import fs from "fs/promises"
import path from "path"

export async function POST() {
  try {
    // Create test results directory if it doesn't exist
    const testResultsDir = path.join(process.cwd(), "public", "test-results")
    await fs.mkdir(testResultsDir, { recursive: true })

    // Run the UI tests
    const results = await runUiTests()

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error running UI tests:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error running UI tests",
      },
      { status: 500 },
    )
  }
}

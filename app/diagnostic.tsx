import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Basic environment check
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "Not set (optional)",
    }

    // Return diagnostic information
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: envStatus,
      message: "If you can see this, the server is responding correctly.",
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Diagnostic check failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

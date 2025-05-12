import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ configured: false }, { status: 500 })
  }

  // Return the URL to our loader script
  return NextResponse.json({
    configured: true,
    mapUrl: `/api/maps/script`,
  })
}

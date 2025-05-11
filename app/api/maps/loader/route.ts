import { NextResponse } from "next/server"

export async function GET() {
  // Server-side only access to the API key
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "Maps API not configured" }, { status: 500 })
  }

  // Return a JSON response with a token that can be used client-side
  // This approach doesn't expose the actual API key
  return NextResponse.json({
    configured: true,
    mapUrl: `/api/maps/proxy`, // Use a proxy endpoint instead of direct Google Maps URL
  })
}

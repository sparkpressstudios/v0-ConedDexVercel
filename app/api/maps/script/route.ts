import { NextResponse } from "next/server"

export async function GET() {
  // Use the non-public environment variable
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return new NextResponse("Google Maps API key is not configured", { status: 500 })
  }

  // Redirect to the Google Maps API with the key
  return NextResponse.redirect(`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`)
}

import { NextResponse } from "next/server"

export async function GET() {
  // Server-side only access to the API key
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "Maps API not configured" }, { status: 500 })
  }

  // Create the Google Maps API URL with the key
  const googleMapsUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initMap`

  try {
    // Fetch the Google Maps API script
    const response = await fetch(googleMapsUrl)
    const scriptContent = await response.text()

    // Return the script content with the correct content type
    return new NextResponse(scriptContent, {
      headers: {
        "Content-Type": "application/javascript",
      },
    })
  } catch (error) {
    console.error("Error proxying Google Maps API:", error)
    return NextResponse.json({ error: "Failed to load Google Maps API" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get("reference")
  const maxwidth = searchParams.get("maxwidth") || "400"

  if (!reference) {
    return NextResponse.json({ error: "Missing photo reference" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "Maps API not configured" }, { status: 500 })
  }

  // Create the Google Maps Photo API URL with the key
  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${reference}&maxwidth=${maxwidth}&key=${apiKey}`

  try {
    // Fetch the photo
    const response = await fetch(photoUrl)

    // If the photo couldn't be fetched, return an error
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch photo" }, { status: response.status })
    }

    // Get the photo data and content type
    const photoData = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/jpeg"

    // Return the photo with the correct content type
    return new NextResponse(photoData, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error("Error proxying Google Maps photo:", error)
    return NextResponse.json({ error: "Failed to load photo" }, { status: 500 })
  }
}

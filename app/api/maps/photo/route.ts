import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Get the photo reference and max width from the query parameters
  const searchParams = request.nextUrl.searchParams
  const photoReference = searchParams.get("reference")
  const maxWidth = searchParams.get("maxwidth") || "400"

  // Server-side only access to the API key
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey || !photoReference) {
    return NextResponse.json(
      { error: !apiKey ? "Maps API not configured" : "Photo reference is required" },
      { status: !apiKey ? 500 : 400 },
    )
  }

  // Create the Google Places Photo API URL with the key
  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`

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
    console.error("Error proxying Google Places photo:", error)
    return NextResponse.json({ error: "Failed to load photo" }, { status: 500 })
  }
}

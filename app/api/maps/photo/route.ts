import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get the photo reference and max width from the query parameters
    const searchParams = request.nextUrl.searchParams
    const photoReference = searchParams.get("reference") || searchParams.get("photoReference")
    const maxWidth = searchParams.get("maxwidth") || searchParams.get("maxWidth") || "400"

    if (!photoReference) {
      return new NextResponse("Photo reference is required", { status: 400 })
    }

    // Get the Google Maps API key from environment variables
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return new NextResponse("Google Maps API key is not configured", { status: 500 })
    }

    // Build the URL for the Google Places Photo API
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`

    // Fetch the photo from Google Places API
    const response = await fetch(url, {
      headers: {
        Accept: "image/*",
      },
    })

    if (!response.ok) {
      return new NextResponse(`Failed to fetch photo: ${response.statusText}`, { status: response.status })
    }

    // Get the image data and content type
    const imageData = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/jpeg"

    // Return the image with the appropriate content type
    return new NextResponse(imageData, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error("Error fetching photo:", error)
    return new NextResponse("Error fetching photo", { status: 500 })
  }
}

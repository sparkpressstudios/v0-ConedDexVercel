import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key is not configured" }, { status: 500 })
    }

    // Determine which Google Maps API to call based on the parameters
    let endpoint = ""
    const params = new URLSearchParams()

    // Add API key to all requests
    params.append("key", apiKey)

    // Place details request
    if (searchParams.has("place_id")) {
      endpoint = "https://maps.googleapis.com/maps/api/place/details/json"
      params.append("place_id", searchParams.get("place_id") || "")
      params.append("fields", "name,geometry,vicinity,formatted_address")
    }
    // Nearby search request
    else if (searchParams.has("lat") && searchParams.has("lng")) {
      endpoint = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
      params.append("location", `${searchParams.get("lat")},${searchParams.get("lng")}`)
      params.append("radius", searchParams.get("radius") || "500")
      params.append("type", searchParams.get("type") || "ice_cream")
    }
    // Geocoding request
    else if (searchParams.has("address")) {
      endpoint = "https://maps.googleapis.com/maps/api/geocode/json"
      params.append("address", searchParams.get("address") || "")
    }
    // Reverse geocoding request
    else if (searchParams.has("latlng")) {
      endpoint = "https://maps.googleapis.com/maps/api/geocode/json"
      params.append("latlng", searchParams.get("latlng") || "")
    } else {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    // Make the request to Google Maps API
    const response = await fetch(`${endpoint}?${params.toString()}`)
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in Google Maps proxy:", error)
    return NextResponse.json({ error: "Failed to proxy request to Google Maps API" }, { status: 500 })
  }
}

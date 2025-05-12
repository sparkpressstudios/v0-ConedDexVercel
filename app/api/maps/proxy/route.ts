import { type NextRequest, NextResponse } from "next/server"
import {
  searchNearbyIceCreamShops,
  getPlaceDetails,
  geocodeAddress,
  autocompletePlaceSearch,
} from "@/lib/services/google-places-service"

export async function GET(request: NextRequest) {
  const { pathname, searchParams } = new URL(request.url)
  const path = pathname.split("/").pop()

  try {
    // Handle different proxy endpoints
    if (path === "nearby") {
      const lat = Number.parseFloat(searchParams.get("lat") || "0")
      const lng = Number.parseFloat(searchParams.get("lng") || "0")
      const radius = Number.parseInt(searchParams.get("radius") || "5000")

      if (!lat || !lng) {
        return NextResponse.json({ error: "Missing lat/lng parameters" }, { status: 400 })
      }

      const results = await searchNearbyIceCreamShops(lat, lng, radius)
      return NextResponse.json(results)
    } else if (path === "details") {
      const placeId = searchParams.get("place_id")

      if (!placeId) {
        return NextResponse.json({ error: "Missing place_id parameter" }, { status: 400 })
      }

      const result = await getPlaceDetails(placeId)
      return NextResponse.json(result)
    } else if (path === "geocode") {
      const address = searchParams.get("address")

      if (!address) {
        return NextResponse.json({ error: "Missing address parameter" }, { status: 400 })
      }

      const result = await geocodeAddress(address)
      return NextResponse.json(result)
    } else if (path === "autocomplete") {
      const input = searchParams.get("input")
      const sessionToken = searchParams.get("sessiontoken") || ""

      if (!input) {
        return NextResponse.json({ error: "Missing input parameter" }, { status: 400 })
      }

      const results = await autocompletePlaceSearch(input, sessionToken)
      return NextResponse.json(results)
    }

    // Handle unknown endpoints
    return NextResponse.json({ error: "Unknown proxy endpoint" }, { status: 404 })
  } catch (error) {
    console.error("Maps proxy error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

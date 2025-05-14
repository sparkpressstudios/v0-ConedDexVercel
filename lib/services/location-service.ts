import { createClient } from "@/lib/supabase/client"

// Get the user's current location with high accuracy
export async function getUserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"))
      return
    }

    // Use high accuracy and a shorter timeout for real-time location checks
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position)
      },
      (error) => {
        console.error("Geolocation error:", error)
        reject(new Error(`Unable to get your location: ${getGeolocationErrorMessage(error.code)}`))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Don't use cached position
      },
    )
  })
}

// Helper function to get a user-friendly error message for geolocation errors
function getGeolocationErrorMessage(errorCode: number): string {
  switch (errorCode) {
    case 1:
      return "Permission denied. Please enable location services."
    case 2:
      return "Position unavailable. Please try again."
    case 3:
      return "Location request timed out. Please try again."
    default:
      return "Unknown error occurred."
  }
}

// Get nearby ice cream shops based on location
export async function getNearbyShops(latitude: number, longitude: number, radius = 100): Promise<any[]> {
  try {
    // First, try to use the Google Places API through our proxy
    try {
      const response = await fetch(
        `/api/maps/proxy?endpoint=nearbysearch/json&location=${latitude},${longitude}&radius=${radius}&type=ice_cream_shop&keyword=ice%20cream&key=placeholder`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === "OK" && data.results && data.results.length > 0) {
        return data.results.map((place: any) => ({
          place_id: place.place_id,
          name: place.name,
          vicinity: place.vicinity,
          location: place.geometry.location,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          photos: place.photos,
        }))
      }
    } catch (error) {
      console.error("Error fetching from Google Places API:", error)
      // Continue to fallback method
    }

    // Fallback: Try to get shops from our database
    const supabase = createClient()

    if (!supabase) {
      throw new Error("Supabase client not available")
    }

    // Calculate rough distance bounds (approximately 100m in lat/lng)
    // This is a rough approximation - 0.001 degrees is about 111 meters
    const latDelta = radius / 111000
    const lngDelta = radius / (111000 * Math.cos(latitude * (Math.PI / 180)))

    const { data, error } = await supabase
      .from("shops")
      .select("id, name, address, latitude, longitude")
      .gte("latitude", latitude - latDelta)
      .lte("latitude", latitude + latDelta)
      .gte("longitude", longitude - lngDelta)
      .lte("longitude", longitude + lngDelta)

    if (error) {
      throw error
    }

    if (data && data.length > 0) {
      return data.map((shop) => ({
        place_id: shop.id,
        name: shop.name,
        vicinity: shop.address,
        location: {
          lat: shop.latitude,
          lng: shop.longitude,
        },
      }))
    }

    // If no shops found in our database, return empty array
    return []
  } catch (error) {
    console.error("Error getting nearby shops:", error)
    throw error
  }
}

// Get details for a specific shop
export async function getShopDetails(placeId: string): Promise<any> {
  try {
    // First check if it's a database ID (uuid format)
    if (placeId.includes("-")) {
      const supabase = createClient()

      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      const { data, error } = await supabase.from("shops").select("*").eq("id", placeId).single()

      if (error) {
        throw error
      }

      if (data) {
        return {
          place_id: data.id,
          name: data.name,
          formatted_address: data.address,
          vicinity: data.address,
          geometry: {
            location: {
              lat: data.latitude,
              lng: data.longitude,
            },
          },
          photos: data.photos || [],
          website: data.website,
          formatted_phone_number: data.phone,
          opening_hours: data.opening_hours,
          rating: data.rating,
        }
      }
    }

    // Otherwise, try Google Places API
    const response = await fetch(
      `/api/maps/proxy?endpoint=details/json&place_id=${placeId}&fields=name,formatted_address,geometry,photos,website,formatted_phone_number,opening_hours,rating&key=placeholder`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`)
    }

    const data = await response.json()

    if (data.status === "OK" && data.result) {
      return data.result
    }

    throw new Error("Shop details not found")
  } catch (error) {
    console.error("Error getting shop details:", error)
    throw error
  }
}

// Calculate distance between two coordinates in meters using the Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c

  return d // Distance in meters
}

// Check if user is near a specific shop
export async function isUserNearShop(shopId: string, maxDistance = 30.48): Promise<boolean> {
  try {
    // Get shop details
    const shopDetails = await getShopDetails(shopId)

    if (!shopDetails || !shopDetails.geometry || !shopDetails.geometry.location) {
      return false
    }

    // Get user's current location
    const position = await getUserLocation()
    const { latitude, longitude } = position.coords

    // Calculate distance
    const distance = calculateDistance(
      latitude,
      longitude,
      shopDetails.geometry.location.lat,
      shopDetails.geometry.location.lng,
    )

    // Return true if user is within maxDistance meters of the shop
    return distance <= maxDistance
  } catch (error) {
    console.error("Error checking if user is near shop:", error)
    return false
  }
}

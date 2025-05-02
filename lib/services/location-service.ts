import { createClient } from "@/lib/supabase/client"

// Location service for verifying user proximity to shops
export async function getUserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    })
  })
}

export async function getNearbyShops(latitude: number, longitude: number, distanceMeters = 30) {
  const supabase = createClient()

  try {
    // Calculate distance using Haversine formula
    const { data, error } = await supabase.rpc("nearby_shops", {
      lat: latitude,
      lng: longitude,
      distance_meters: distanceMeters,
    })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error getting nearby shops:", error)
    return []
  }
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Haversine formula to calculate distance between two points in meters
  const R = 6371e3 // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance // Distance in meters
}

export function isWithinRange(
  userLat: number,
  userLng: number,
  shopLat: number,
  shopLng: number,
  rangeMeters = 30,
): boolean {
  const distance = calculateDistance(userLat, userLng, shopLat, shopLng)
  return distance <= rangeMeters
}

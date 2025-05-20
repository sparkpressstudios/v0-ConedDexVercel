// Get user's location using the Geolocation API
export const getUserLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position)
      },
      (error) => {
        let errorMessage = "Unknown error occurred while getting your location."

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location services in your browser settings."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please try again."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again."
            break
        }

        reject(new Error(errorMessage))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  })
}

// Calculate distance between two coordinates in meters using the Haversine formula
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}

// Get nearby ice cream shops using Google Places API
export const getNearbyShops = async (latitude: number, longitude: number, radius = 500): Promise<any[]> => {
  try {
    // Use our server-side proxy to make the request to Google Places API
    const response = await fetch(`/api/maps/proxy?lat=${latitude}&lng=${longitude}&radius=${radius}&type=ice_cream`)

    if (!response.ok) {
      throw new Error(`Failed to fetch nearby shops: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Places API error: ${data.status}`)
    }

    return data.results || []
  } catch (error) {
    console.error("Error fetching nearby shops:", error)
    throw error
  }
}

// Get details for a specific shop using its place_id
export const getShopDetails = async (placeId: string): Promise<any> => {
  try {
    // Use our server-side proxy to make the request to Google Places API
    const response = await fetch(`/api/maps/proxy?place_id=${placeId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch shop details: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status !== "OK") {
      throw new Error(`Places API error: ${data.status}`)
    }

    return data.result || null
  } catch (error) {
    console.error("Error fetching shop details:", error)
    throw error
  }
}

// Get a static map image URL for a location
export const getStaticMapUrl = (latitude: number, longitude: number, zoom = 15, width = 400, height = 200): string => {
  return `/api/maps/static?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${latitude},${longitude}`
}

// Geocode an address to get coordinates
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
  try {
    const response = await fetch(`/api/maps/proxy?address=${encodeURIComponent(address)}`)

    if (!response.ok) {
      throw new Error(`Failed to geocode address: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status !== "OK") {
      throw new Error(`Geocoding API error: ${data.status}`)
    }

    if (!data.results || data.results.length === 0) {
      throw new Error("No results found for this address")
    }

    return data.results[0].geometry.location
  } catch (error) {
    console.error("Error geocoding address:", error)
    throw error
  }
}

// Get the user's current address based on coordinates
export const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await fetch(`/api/maps/proxy?latlng=${latitude},${longitude}`)

    if (!response.ok) {
      throw new Error(`Failed to reverse geocode: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status !== "OK") {
      throw new Error(`Reverse geocoding API error: ${data.status}`)
    }

    if (!data.results || data.results.length === 0) {
      throw new Error("No address found for these coordinates")
    }

    // Return the formatted address
    return data.results[0].formatted_address
  } catch (error) {
    console.error("Error reverse geocoding:", error)
    throw error
  }
}

// Handle location errors in a user-friendly way
export const handleLocationError = (error: any): string => {
  console.error("Location error:", error)

  if (error.code) {
    // GeolocationPositionError
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        return "Location access denied. Please enable location services in your browser settings."
      case 2: // POSITION_UNAVAILABLE
        return "Your location is currently unavailable. Please try again later."
      case 3: // TIMEOUT
        return "Location request timed out. Please try again."
      default:
        return "An unknown location error occurred."
    }
  }

  return error.message || "Failed to access your location."
}

// Check if geolocation is supported and permission is granted
export const checkLocationPermission = async (): Promise<boolean> => {
  if (!navigator.geolocation) {
    return false
  }

  try {
    const result = await navigator.permissions.query({ name: "geolocation" as PermissionName })
    return result.state === "granted" || result.state === "prompt"
  } catch (error) {
    console.error("Error checking location permission:", error)
    return false
  }
}

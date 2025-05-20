"use server"

import { cookies } from "next/headers"

/**
 * Gets the Google Maps API key from environment variables
 * This is a server-side only function
 */
export async function getMapsApiKey(): Promise<string> {
  // Use the non-public environment variable
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    throw new Error("Google Maps API key not found in environment variables")
  }

  return apiKey
}

/**
 * Generates a Google Maps script URL with the API key and specified libraries
 * This is a server-side only function that securely includes the API key
 */
export async function getGoogleMapsScriptUrl(libraries: string[] = ["places"]): Promise<string> {
  const apiKey = await getMapsApiKey()
  return `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(",")}&v=weekly`
}

/**
 * Stores the user's last known location in cookies
 */
export async function storeUserLocation(lat: number, lng: number): Promise<void> {
  cookies().set("user_location_lat", lat.toString(), {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  cookies().set("user_location_lng", lng.toString(), {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })
}

/**
 * Gets the user's last known location from cookies
 */
export async function getUserLocation(): Promise<{ lat: number; lng: number } | null> {
  const cookieStore = cookies()
  const lat = cookieStore.get("user_location_lat")
  const lng = cookieStore.get("user_location_lng")

  if (!lat || !lng) {
    return null
  }

  return {
    lat: Number.parseFloat(lat.value),
    lng: Number.parseFloat(lng.value),
  }
}

export async function loadGoogleMapsScript() {
  // Use the non-public environment variable
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    throw new Error("Google Maps API key is not configured")
  }

  // Return success without exposing the key
  return { success: true }
}

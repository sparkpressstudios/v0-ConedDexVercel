"use server"

/**
 * Server action to check if Google Maps API key is available
 * This allows us to check for the key without exposing it to the client
 */
export async function isGoogleMapsKeyAvailable(): Promise<boolean> {
  return !!process.env.GOOGLE_MAPS_API_KEY
}

/**
 * Server action to get the Google Maps API script URL
 * This allows us to load the Maps API without exposing the key in client code
 */
export async function getGoogleMapsScriptUrl(libraries: string[] = ["places"]): Promise<string> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error("Google Maps API key is not available")
  }

  const librariesParam = libraries.join(",")
  return `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${librariesParam}&callback=Function.prototype`
}

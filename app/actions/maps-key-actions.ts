"use server"

export async function getGoogleMapsScriptUrl(libraries: string[] = ["places"]): Promise<string> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    throw new Error("Google Maps API key is not configured")
  }

  const librariesParam = libraries.join(",")
  return `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${librariesParam}&v=weekly`
}

export async function isGoogleMapsKeyAvailable(): Promise<boolean> {
  return !!process.env.GOOGLE_MAPS_API_KEY
}

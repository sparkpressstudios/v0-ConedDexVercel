import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const libraries = searchParams.get("libraries")?.split(",") || ["places"]
    const callback = searchParams.get("callback") || "initMap"

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key is not defined" }, { status: 500 })
    }

    const librariesParam = libraries.join(",")
    const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${librariesParam}&callback=${callback}`

    // Fetch the script content
    const response = await fetch(scriptUrl)
    const scriptContent = await response.text()

    // Return the script content with the correct content type
    return new NextResponse(scriptContent, {
      headers: {
        "Content-Type": "application/javascript",
      },
    })
  } catch (error) {
    console.error("Error serving Maps script:", error)
    return NextResponse.json({ error: "Failed to serve Maps script" }, { status: 500 })
  }
}

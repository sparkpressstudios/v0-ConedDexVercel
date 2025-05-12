import { NextResponse } from "next/server"
import { getMapsApiUrl } from "../actions"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const libraries = searchParams.get("libraries")?.split(",") || ["places"]

    const apiUrl = await getMapsApiUrl(libraries)

    return NextResponse.json({ apiUrl })
  } catch (error) {
    console.error("Error getting Maps API URL:", error)
    return NextResponse.json({ error: "Failed to get Maps API URL" }, { status: 500 })
  }
}

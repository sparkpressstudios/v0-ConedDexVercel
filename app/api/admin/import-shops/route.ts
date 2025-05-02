import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { shops } = await request.json()

    if (!shops || !Array.isArray(shops) || shops.length === 0) {
      return NextResponse.json({ error: "Valid shops array is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Prepare shop data for insertion
    const shopsToInsert = shops.map((shop) => ({
      name: shop.name || "Unknown Shop",
      address: shop.address,
      phone: shop.phone,
      website: shop.website,
      source: "web_scraping",
      is_verified: false,
      created_at: new Date().toISOString(),
    }))

    // Insert shops into database
    const { data, error } = await supabase.from("shops").insert(shopsToInsert).select()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      imported: data.length,
      shops: data,
    })
  } catch (error) {
    console.error("Error importing shops:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import shops" },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getFlavorPopularity } from "@/app/actions/analytics-data-actions"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const shopId = params.id

    // Verify user has access to this shop
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: shop, error: shopError } = await supabase.from("shops").select("owner_id").eq("id", shopId).single()

    if (shopError || !shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }

    // Check if user is owner or admin
    const isOwner = shop.owner_id === session.user.id
    const { data: userRoles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id)

    const isAdmin = userRoles?.some((ur) => ur.role === "admin") || false

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get the data
    const data = await getFlavorPopularity(shopId)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in flavors API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

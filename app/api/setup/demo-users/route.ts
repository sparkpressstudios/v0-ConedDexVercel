import { NextResponse } from "next/server"
import { ensureDemoUsers } from "@/lib/auth/ensure-demo-users"

export async function GET() {
  try {
    await ensureDemoUsers()
    return NextResponse.json({ success: true, message: "Demo users setup complete" })
  } catch (error) {
    console.error("Error setting up demo users:", error)
    return NextResponse.json({ success: false, error: "Failed to set up demo users" }, { status: 500 })
  }
}

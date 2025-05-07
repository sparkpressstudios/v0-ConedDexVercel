import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Demo user data
const DEMO_USERS = [
  {
    email: "admin@conedex.app",
    password: process.env.DEMO_ADMIN_PASSWORD || "admin-password",
    role: "admin",
    name: "Alex Admin",
  },
  {
    email: "shopowner@conedex.app",
    password: process.env.DEMO_SHOPOWNER_PASSWORD || "shopowner-password",
    role: "shop_owner",
    name: "Sam Scooper",
  },
  {
    email: "explorer@conedex.app",
    password: process.env.DEMO_EXPLORER_PASSWORD || "explorer-password",
    role: "explorer",
    name: "Emma Explorer",
  },
]

export async function GET() {
  const results = []
  const supabase = createClient()

  for (const user of DEMO_USERS) {
    try {
      // Try to get the user
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers()

      const existingUser = userData?.users.find((u) => u.email === user.email)

      if (!existingUser) {
        // User doesn't exist, create them
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            role: user.role,
            name: user.name,
          },
        })

        if (createError) {
          results.push({
            email: user.email,
            status: "error",
            message: createError.message,
          })
        } else {
          results.push({
            email: user.email,
            status: "created",
            userId: newUser.user.id,
          })
        }
      } else {
        // User exists
        results.push({
          email: user.email,
          status: "exists",
          userId: existingUser.id,
        })
      }
    } catch (error: any) {
      results.push({
        email: user.email,
        status: "error",
        message: error.message || "Unknown error",
      })
    }
  }

  return NextResponse.json({ results })
}

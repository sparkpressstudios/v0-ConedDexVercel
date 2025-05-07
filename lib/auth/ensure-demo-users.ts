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

/**
 * Ensures that all demo users exist in the database
 * This can be run during deployment or server startup
 */
export async function ensureDemoUsers() {
  console.log("Ensuring demo users exist...")
  const supabase = createClient()

  for (const user of DEMO_USERS) {
    try {
      // Check if user exists
      const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserByEmail(user.email)

      if (checkError || !existingUser) {
        console.log(`Creating demo user: ${user.email}`)

        // Create the user
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            role: user.role,
            name: user.name,
          },
        })

        if (error) {
          console.error(`Failed to create demo user ${user.email}:`, error)
        } else {
          console.log(`Successfully created demo user: ${user.email}`)

          // Create profile record if needed
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            created_at: new Date().toISOString(),
          })

          if (profileError) {
            console.error(`Failed to create profile for ${user.email}:`, profileError)
          }
        }
      } else {
        console.log(`Demo user already exists: ${user.email}`)
      }
    } catch (error) {
      console.error(`Error processing demo user ${user.email}:`, error)
    }
  }

  console.log("Demo user verification complete")
}

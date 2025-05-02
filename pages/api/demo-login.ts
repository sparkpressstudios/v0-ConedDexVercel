import type { NextApiRequest, NextApiResponse } from "next"
import { createPagesClient } from "../../lib/supabase/pages-client"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { role } = req.body

  if (!role) {
    return res.status(400).json({ error: "Role is required" })
  }

  let email = ""
  let password = ""

  switch (role) {
    case "admin":
      email = "admin@conedex.com"
      password = process.env.DEMO_ADMIN_PASSWORD || "demo-password"
      break
    case "explorer":
      email = "explorer@conedex.com"
      password = process.env.DEMO_EXPLORER_PASSWORD || "demo-password"
      break
    case "shopowner":
      email = "shopowner@conedex.com"
      password = process.env.DEMO_SHOPOWNER_PASSWORD || "demo-password"
      break
    default:
      return res.status(400).json({ error: "Invalid role" })
  }

  try {
    const supabase = createPagesClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return res.status(200).json({ user: data.user })
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "An error occurred during login" })
  }
}

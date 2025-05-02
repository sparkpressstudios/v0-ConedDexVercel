import type { NextApiRequest, NextApiResponse } from "next"
import { demoLoginPages } from "../../lib/auth/pages-auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { role } = req.body

    if (!role || !["admin", "explorer", "shopowner"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" })
    }

    const data = await demoLoginPages(role)
    return res.status(200).json(data)
  } catch (error: any) {
    console.error("Demo login error:", error.message)
    return res.status(500).json({ error: error.message || "An error occurred during login" })
  }
}

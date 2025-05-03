"use server"

import { signIn } from "@/lib/auth/auth-compat"

export async function loginAsAdmin() {
  const password = process.env.DEMO_ADMIN_PASSWORD || "admin-password"
  return signIn("admin@conedex.com", password)
}

export async function loginAsExplorer() {
  const password = process.env.DEMO_EXPLORER_PASSWORD || "explorer-password"
  return signIn("explorer@conedex.com", password)
}

export async function loginAsShopOwner() {
  const password = process.env.DEMO_SHOPOWNER_PASSWORD || "shopowner-password"
  return signIn("shopowner@conedex.com", password)
}

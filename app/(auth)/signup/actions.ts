"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function createExplorerAccount(formData: FormData) {
  const supabase = createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const reason = formData.get("reason") as string

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          account_type: "explorer",
          signup_reason: reason,
        },
      },
    })

    if (error) throw error

    // Redirect to dashboard or confirmation page
    redirect("/dashboard")
  } catch (error) {
    console.error("Error creating explorer account:", error)
    return { success: false, error: "Failed to create account" }
  }
}

export async function createShopOwnerAccount(formData: FormData) {
  const supabase = createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          account_type: "shop_owner",
        },
      },
    })

    if (error) throw error

    // Redirect to shop claim page
    redirect("/dashboard/shop/claim")
  } catch (error) {
    console.error("Error creating shop owner account:", error)
    return { success: false, error: "Failed to create account" }
  }
}

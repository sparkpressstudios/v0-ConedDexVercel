import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth/auth-compat"
import { SignupForm } from "./client"

export const metadata: Metadata = {
  title: "Sign Up | ConeDex",
  description: "Create a new ConeDex account",
}

export default async function SignupPage() {
  // Check if user is already logged in
  const user = await getAuthUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <SignupForm />
    </div>
  )
}

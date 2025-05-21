"use client"

import { LoginPanel } from "@/components/auth/login-panel"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get("redirect") || "/dashboard"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <LoginPanel
        redirectPath={redirectPath}
        showSignupLink={true}
        showForgotPassword={true}
        showDemoAccess={true}
        className="w-full max-w-md"
      />
    </div>
  )
}

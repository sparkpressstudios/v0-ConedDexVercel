"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export default function LoginButtons() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const handleDemoLogin = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(email) // Track which button is loading

      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)

      const response = await fetch("/api/auth/demo-login", {
        method: "POST",
        body: formData,
      })

      if (response.ok || response.redirected) {
        // Successful login, redirect to dashboard
        router.push("/dashboard")
        return
      }

      // Handle error responses
      try {
        const data = await response.json()
        console.error("Login error:", data)

        // Display a user-friendly error message
        if (data.code === "DEMO_USER_CREATION_FAILED") {
          setError("Could not create demo user account. Please try again or contact support.")
        } else if (data.code === "AUTH_FAILED") {
          setError("Invalid login credentials. Please check your email and password.")
        } else if (data.code === "AUTH_FAILED_AFTER_CREATION") {
          setError("Account created but login failed. Please try again.")
        } else {
          setError(data.error || "Login failed. Please try again.")
        }
      } catch (parseError) {
        // If we can't parse the JSON response
        setError("Login failed with an unexpected error. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again later.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full relative"
          onClick={() =>
            handleDemoLogin("admin@conedex.app", process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || "admin-password")
          }
          disabled={loading !== null}
        >
          {loading === "admin@conedex.app" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login as Admin"
          )}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            handleDemoLogin(
              "shopowner@conedex.app",
              process.env.NEXT_PUBLIC_DEMO_SHOPOWNER_PASSWORD || "shopowner-password",
            )
          }
          disabled={loading !== null}
        >
          {loading === "shopowner@conedex.app" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login as Shop Owner"
          )}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            handleDemoLogin(
              "explorer@conedex.app",
              process.env.NEXT_PUBLIC_DEMO_EXPLORER_PASSWORD || "explorer-password",
            )
          }
          disabled={loading !== null}
        >
          {loading === "explorer@conedex.app" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login as Explorer"
          )}
        </Button>
      </div>
    </div>
  )
}

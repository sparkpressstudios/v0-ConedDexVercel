"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DemoLogin() {
  const [email, setEmail] = useState("admin@conedex.app")
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || "admin-password")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Function to create a demo user
  const createDemoUser = async (email: string, password: string, role: string, name: string) => {
    try {
      setLoading(true)
      setError(null)
      setSuccessMessage(`Attempting to create user: ${email}...`)

      // First try to sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name,
          },
        },
      })

      if (signUpError) {
        console.error("Sign up error:", signUpError)
        setError(`Failed to create user: ${signUpError.message}`)
        return false
      }

      setSuccessMessage(`User ${email} created or already exists. Attempting to sign in...`)
      return true
    } catch (error: any) {
      console.error("Create user error:", error)
      setError(`Unexpected error: ${error.message}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Function to handle login
  const handleLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccessMessage("Attempting to sign in...")

      // Try to sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error("Sign in error:", signInError)

        // If login fails, try to create the user first
        if (signInError.message.includes("Invalid login credentials")) {
          setSuccessMessage("Login failed. Attempting to create user first...")

          let role = "explorer"
          let name = "Demo User"

          if (email.includes("admin")) {
            role = "admin"
            name = "Alex Admin"
          } else if (email.includes("shopowner")) {
            role = "shop_owner"
            name = "Sam Scooper"
          } else if (email.includes("explorer")) {
            role = "explorer"
            name = "Emma Explorer"
          }

          const created = await createDemoUser(email, password, role, name)

          if (created) {
            // Try to sign in again
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email,
              password,
            })

            if (retryError) {
              setError(`Created user but still can't sign in: ${retryError.message}`)
              return
            }

            setSuccessMessage("Successfully created user and signed in!")
            router.push("/dashboard")
            return
          } else {
            setError("Failed to create user and sign in.")
            return
          }
        }

        setError(`Authentication failed: ${signInError.message}`)
        return
      }

      setSuccessMessage("Successfully signed in!")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)
      setError(`Unexpected error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Quick login buttons
  const quickLogin = (userType: string) => {
    if (userType === "admin") {
      setEmail("admin@conedex.app")
      setPassword(process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || "admin-password")
    } else if (userType === "shopowner") {
      setEmail("shopowner@conedex.app")
      setPassword(process.env.NEXT_PUBLIC_DEMO_SHOPOWNER_PASSWORD || "shopowner-password")
    } else if (userType === "explorer") {
      setEmail("explorer@conedex.app")
      setPassword(process.env.NEXT_PUBLIC_DEMO_EXPLORER_PASSWORD || "explorer-password")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Demo Login</CardTitle>
          <CardDescription>Sign in with a demo account to access the ConeDex Platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert>
              <AlertTitle>Status</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <div className="pt-2">
            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-gray-500 mb-2">Quick Login:</div>
          <div className="grid grid-cols-3 gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => quickLogin("admin")} disabled={loading}>
              Admin
            </Button>
            <Button variant="outline" size="sm" onClick={() => quickLogin("shopowner")} disabled={loading}>
              Shop Owner
            </Button>
            <Button variant="outline" size="sm" onClick={() => quickLogin("explorer")} disabled={loading}>
              Explorer
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

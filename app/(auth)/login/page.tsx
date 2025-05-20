"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client-browser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get("redirect") || "/dashboard"
  const [verificationNeeded, setVerificationNeeded] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState("")

  // Use a ref to ensure we have a stable reference to the Supabase client
  const [supabase] = useState(() => createClient())

  // Demo user credentials
  const demoUsers = [
    {
      email: "explorer@conedex.app",
      password: process.env.NEXT_PUBLIC_DEMO_EXPLORER_PASSWORD || "demo123",
      role: "explorer",
    },
    {
      email: "shopowner@conedex.app",
      password: process.env.NEXT_PUBLIC_DEMO_SHOPOWNER_PASSWORD || "demo123",
      role: "shopowner",
    },
    {
      email: "admin@conedex.app",
      password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || "demo123",
      role: "admin",
    },
  ]

  // Clear any URL error parameters on mount
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.has("error")) {
      url.searchParams.delete("error")
      window.history.replaceState({}, "", url.toString())
    }
  }, [])

  const handleDemoLogin = async (role: string) => {
    setLoading(true)
    setError(null)

    try {
      // Set the demo user cookie directly
      const demoUser = demoUsers.find((user) => user.role === role)
      if (!demoUser) {
        throw new Error("Invalid demo user role")
      }

      // Set the cookie directly
      document.cookie = `conedex_demo_user=${demoUser.email}; path=/; max-age=86400; samesite=lax;`

      // Try to use the API for additional setup
      try {
        const response = await fetch("/api/auth/demo-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
          }),
        })

        if (!response.ok) {
          console.warn("Demo login API failed, but continuing with cookie auth")
        }
      } catch (apiError) {
        console.warn("Demo login API error, but continuing with cookie auth:", apiError)
      }

      // Redirect based on role
      if (role === "admin") {
        router.push("/dashboard/admin")
      } else if (role === "shopowner") {
        router.push("/dashboard/shop")
      } else {
        router.push(redirectPath)
      }
    } catch (error: any) {
      console.error("Demo login error:", error)
      setError(error.message || "Failed to login with demo account")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Check if this is a demo user
      const demoUser = demoUsers.find((user) => user.email === email && user.password === password)

      if (demoUser) {
        return handleDemoLogin(demoUser.role)
      }

      // Regular Supabase authentication
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Check if this is an email verification error
        if (error.message.includes("Email not confirmed")) {
          setVerificationNeeded(true)
          setVerificationEmail(email)
          throw new Error("Please verify your email before logging in. Check your inbox for a verification link.")
        }
        throw new Error(error.message)
      }

      router.push(redirectPath)
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!verificationEmail) return

    setLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: verificationEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Image
                src="https://sjc.microlink.io/gdEib8U5L90kgKDliz_VYrZpWgaMrn8on2Fz9qWnZxr2QrBTWwUfaP3YrUCpSONUwTyQP8FLwdSoJXG2EUflIg.jpeg"
                alt="ConeDex Logo"
                width={64}
                height={64}
                className="rounded-full"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to ConeDex</CardTitle>
          <CardDescription>Enter your email to sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {verificationNeeded && (
            <div className="mb-4 space-y-2">
              <Alert variant="warning">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full"
              >
                Resend Verification Email
              </Button>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="w-full border-t pt-4">
            <h3 className="mb-2 text-sm font-medium">Demo Access</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Contact an administrator for demo account access or create a new account.</p>
              <p>For testing purposes, you can use the demo buttons below:</p>
              <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-3">
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin("explorer")} disabled={loading}>
                  Try as Explorer
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin("shopowner")} disabled={loading}>
                  Try as Shop Owner
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin("admin")} disabled={loading}>
                  Try as Admin
                </Button>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

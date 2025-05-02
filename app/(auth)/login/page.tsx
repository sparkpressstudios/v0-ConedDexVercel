"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { setDemoUser } from "@/lib/auth/demo-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Use a ref to ensure we have a stable reference to the Supabase client
  const [supabase] = useState(() => createClient())

  // Demo user credentials
  const demoUsers = [
    { email: "explorer@conedex.app", password: "demo123", role: "Explorer" },
    { email: "shopowner@conedex.app", password: "demo123", role: "Shop Owner" },
    { email: "admin@conedex.app", password: "demo123", role: "Admin" },
  ]

  // Clear any URL error parameters on mount
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.has("error")) {
      url.searchParams.delete("error")
      window.history.replaceState({}, "", url.toString())
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Check if this is a demo user
      const demoUser = demoUsers.find((user) => user.email === email && user.password === password)

      if (demoUser) {
        // Set demo user in both localStorage and cookie
        setDemoUser(email)

        // Redirect based on role
        if (email === "admin@conedex.app") {
          router.push("/dashboard/admin")
        } else if (email === "shopowner@conedex.app") {
          router.push("/dashboard/shop")
        } else {
          router.push("/dashboard")
        }
        return
      }

      // Regular Supabase authentication
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      setError(error.message)
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
            <h3 className="mb-2 text-sm font-medium">Demo Accounts</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              {demoUsers.map((user) => (
                <div key={user.email} className="flex justify-between">
                  <span>
                    {user.role}: {user.email}
                  </span>
                  <span>Password: {user.password}</span>
                </div>
              ))}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

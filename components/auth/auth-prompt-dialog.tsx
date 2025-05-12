"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface AuthPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
}

export function AuthPromptDialog({
  open,
  onOpenChange,
  title = "Sign in to continue",
  description = "Sign in or create an account to access all features",
}: AuthPromptDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [isLoading, setIsLoading] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Signup form state
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupName, setSignupName] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!loginEmail || !loginPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "You have been signed in",
      })

      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!signupEmail || !signupPassword || !signupName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            name: signupName,
          },
        },
      })

      if (error) throw error

      toast({
        title: "Account created",
        description: "Please check your email to verify your account",
      })

      // Switch to login tab
      setActiveTab("login")
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (role = "explorer") => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        throw new Error("Failed to login with demo account")
      }

      toast({
        title: "Demo login successful",
        description: `You are now signed in as a demo ${role}`,
      })

      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 pt-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Name</Label>
                <Input
                  id="signup-name"
                  placeholder="Your name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Demo Access</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin("explorer")} disabled={isLoading}>
              Explorer
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin("shopowner")} disabled={isLoading}>
              Shop Owner
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin("admin")} disabled={isLoading}>
              Admin
            </Button>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-0">
          <Button variant="link" size="sm" className="px-0" onClick={() => onOpenChange(false)}>
            Continue as guest
          </Button>
          <Button variant="link" size="sm" onClick={() => router.push("/login")}>
            More options
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

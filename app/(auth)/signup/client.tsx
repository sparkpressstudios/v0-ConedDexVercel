"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"explorer" | "shop-owner">("explorer")

  // Explorer form state
  const [explorerFirstName, setExplorerFirstName] = useState("")
  const [explorerLastName, setExplorerLastName] = useState("")
  const [explorerEmail, setExplorerEmail] = useState("")
  const [explorerPassword, setExplorerPassword] = useState("")
  const [explorerConfirmPassword, setExplorerConfirmPassword] = useState("")
  const [explorerReason, setExplorerReason] = useState("discover")

  // Shop owner form state
  const [ownerFirstName, setOwnerFirstName] = useState("")
  const [ownerLastName, setOwnerLastName] = useState("")
  const [ownerEmail, setOwnerEmail] = useState("")
  const [ownerPassword, setOwnerPassword] = useState("")
  const [ownerConfirmPassword, setOwnerConfirmPassword] = useState("")

  const handleExplorerSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!explorerFirstName || !explorerLastName || !explorerEmail || !explorerPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (explorerPassword !== explorerConfirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email: explorerEmail,
        password: explorerPassword,
        options: {
          data: {
            first_name: explorerFirstName,
            last_name: explorerLastName,
            full_name: `${explorerFirstName} ${explorerLastName}`,
            account_type: "explorer",
            signup_reason: explorerReason,
          },
        },
      })

      if (error) throw error

      toast({
        title: "Account created",
        description: "Please check your email to verify your account",
      })

      // Redirect to dashboard
      router.push("/dashboard")
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

  const handleShopOwnerSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!ownerFirstName || !ownerLastName || !ownerEmail || !ownerPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (ownerPassword !== ownerConfirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email: ownerEmail,
        password: ownerPassword,
        options: {
          data: {
            first_name: ownerFirstName,
            last_name: ownerLastName,
            full_name: `${ownerFirstName} ${ownerLastName}`,
            account_type: "shop_owner",
          },
        },
      })

      if (error) throw error

      toast({
        title: "Account created",
        description: "Please check your email to verify your account",
      })

      // Redirect to shop claim page
      router.push("/dashboard/shop/claim")
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">Join ConeDex to track and discover ice cream flavors</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="explorer"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "explorer" | "shop-owner")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="explorer">Ice Cream Explorer</TabsTrigger>
            <TabsTrigger value="shop-owner">Shop Owner</TabsTrigger>
          </TabsList>

          <TabsContent value="explorer">
            <form onSubmit={handleExplorerSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="explorer-firstName">First Name</Label>
                  <Input
                    id="explorer-firstName"
                    placeholder="John"
                    value={explorerFirstName}
                    onChange={(e) => setExplorerFirstName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="explorer-lastName">Last Name</Label>
                  <Input
                    id="explorer-lastName"
                    placeholder="Doe"
                    value={explorerLastName}
                    onChange={(e) => setExplorerLastName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="explorer-email">Email</Label>
                <Input
                  id="explorer-email"
                  type="email"
                  placeholder="your@email.com"
                  value={explorerEmail}
                  onChange={(e) => setExplorerEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="explorer-password">Password</Label>
                <Input
                  id="explorer-password"
                  type="password"
                  value={explorerPassword}
                  onChange={(e) => setExplorerPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="explorer-confirmPassword">Confirm Password</Label>
                <Input
                  id="explorer-confirmPassword"
                  type="password"
                  value={explorerConfirmPassword}
                  onChange={(e) => setExplorerConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>What brings you to ConeDex?</Label>
                <RadioGroup value={explorerReason} onValueChange={setExplorerReason} disabled={isLoading}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="discover" id="discover" />
                    <Label htmlFor="discover" className="font-normal">
                      Discover new ice cream flavors
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="track" id="track" />
                    <Label htmlFor="track" className="font-normal">
                      Track my ice cream adventures
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="social" id="social" />
                    <Label htmlFor="social" className="font-normal">
                      Connect with other ice cream enthusiasts
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full bg-mint-600 hover:bg-mint-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Explorer Account"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="shop-owner">
            <form onSubmit={handleShopOwnerSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner-firstName">First Name</Label>
                  <Input
                    id="owner-firstName"
                    placeholder="John"
                    value={ownerFirstName}
                    onChange={(e) => setOwnerFirstName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner-lastName">Last Name</Label>
                  <Input
                    id="owner-lastName"
                    placeholder="Doe"
                    value={ownerLastName}
                    onChange={(e) => setOwnerLastName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-email">Email</Label>
                <Input
                  id="owner-email"
                  type="email"
                  placeholder="your@email.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-password">Password</Label>
                <Input
                  id="owner-password"
                  type="password"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-confirmPassword">Confirm Password</Label>
                <Input
                  id="owner-confirmPassword"
                  type="password"
                  value={ownerConfirmPassword}
                  onChange={(e) => setOwnerConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="rounded-lg border p-4 bg-blue-50 border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">Shop Owner Process:</h3>
                <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                  <li>Create your account</li>
                  <li>Search for your ice cream shop</li>
                  <li>If not listed, you can add your shop</li>
                  <li>Verify ownership to manage your shop profile</li>
                </ol>
              </div>

              <Button type="submit" className="w-full bg-blueberry-600 hover:bg-blueberry-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Shop Owner Account"
                )}
              </Button>

              <div className="text-center text-sm text-gray-500">
                After signup, you'll be directed to search for or add your shop
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-mint-600 hover:underline">
            Login
          </Link>
        </div>
        <div className="text-center text-xs text-gray-500">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

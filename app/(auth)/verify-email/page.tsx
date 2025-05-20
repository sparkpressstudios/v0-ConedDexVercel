"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client-browser"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token and type from query params
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        if (!token || type !== "email_verification") {
          setError("Invalid verification link. Please request a new one.")
          setIsLoading(false)
          return
        }

        // Call Supabase API to verify the email
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        })

        if (error) {
          throw error
        }

        // Also update the profile to mark email as verified
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) {
          await supabase
            .from("profiles")
            .update({
              email_verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userData.user.id)
        }

        setIsVerified(true)
        toast({
          title: "Email verified",
          description: "Your email has been verified successfully.",
        })
      } catch (error: any) {
        setError(error.message || "Verification failed. Please try again.")
        toast({
          title: "Verification failed",
          description: error.message || "Please try again or request a new verification link.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams, supabase, toast])

  const handleResendVerification = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: searchParams.get("email") || "",
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

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
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>Verifying your email address...</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p>Verifying your email address...</p>
            </div>
          )}

          {!isLoading && isVerified && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Verification Successful!</h3>
              <p className="mb-6">Your email has been verified successfully.</p>
              <Button onClick={() => router.push("/dashboard")} className="w-full max-w-xs">
                Go to Dashboard
              </Button>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-8">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Verification Failed</h3>
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={handleResendVerification} className="w-full max-w-xs mb-4" variant="outline">
                Resend Verification
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            <Link href="/login" className="text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

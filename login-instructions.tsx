"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"

export default function LoginInstructions() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">ConeDex Login Instructions</h1>

      <Alert className="mb-8 max-w-3xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important Note</AlertTitle>
        <AlertDescription>
          Since these are demo accounts created directly in the database, you'll need to set up passwords through the
          Supabase Auth dashboard or use passwordless login methods.
        </AlertDescription>
      </Alert>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Setting Up Demo Account Passwords</CardTitle>
          <CardDescription>Follow these steps to set up passwords for the demo accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Option 1: Use Supabase Auth Dashboard</h3>
            <ol className="list-decimal list-inside space-y-2 pl-4">
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to Authentication → Users</li>
              <li>Find the demo user accounts (admin@conedex.com, shopowner@conedex.com, explorer@conedex.com)</li>
              <li>Click on each user and select "Reset password"</li>
              <li>Set a new password for each account</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Option 2: Use Magic Link Login</h3>
            <ol className="list-decimal list-inside space-y-2 pl-4">
              <li>Go to the ConeDex login page</li>
              <li>Enter the email for the account you want to access</li>
              <li>Click "Magic Link" or "Passwordless Login" if available</li>
              <li>Check the email inbox for the magic link</li>
              <li>Click the link to log in without a password</li>
            </ol>
            <div className="bg-amber-50 p-4 rounded-md text-amber-800 text-sm mt-2">
              <Info className="h-4 w-4 inline-block mr-2" />
              Note: For this to work, you need to have email sending configured in your Supabase project.
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Option 3: Update User Passwords in Database</h3>
            <p className="text-sm text-muted-foreground">
              If you have direct database access, you can update the encrypted_password field in the auth.users table.
              However, this requires generating proper password hashes and is not recommended unless you're familiar
              with Supabase Auth.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline">Back to Dashboard</Button>
          <Button>Go to Login Page</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

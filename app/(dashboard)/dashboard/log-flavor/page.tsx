import { createServerClient } from "@/lib/supabase/server"
import LogFlavorForm from "@/components/flavor/log-flavor-form"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default async function LogFlavorPage() {
  let session = null
  let error = null

  try {
    const supabase = createServerClient()

    // Check if user is authenticated
    const sessionResponse = await supabase.auth.getSession()
    session = sessionResponse.data.session
  } catch (err) {
    console.error("Error in LogFlavorPage:", err)
    error = "Failed to connect to the database. Using demo mode."
  }

  // If there's an error or no session, we'll still render the page
  // The LogFlavorForm component will handle demo mode

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Log a New Flavor</h1>
      </div>

      <p className="text-muted-foreground">
        Record your ice cream adventures! Log a new flavor you've tried and add it to your ConeDex. Remember, you need
        to be within 100 feet of an ice cream shop to log a flavor.
      </p>

      {error && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connection Issue</AlertTitle>
          <AlertDescription>{error} Some features may be limited.</AlertDescription>
        </Alert>
      )}

      <ErrorBoundary>
        <LogFlavorForm demoMode={!!error || !session} />
      </ErrorBoundary>
    </div>
  )
}

import { createServerClient } from "@/lib/supabase/server"
import LogFlavorForm from "@/components/flavor/log-flavor-form"

export default async function LogFlavorPage() {
  const supabase = createServerClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Log a New Flavor</h1>
      </div>

      <p className="text-muted-foreground">
        Record your ice cream adventures! Log a new flavor you've tried and add it to your ConeDex. Remember, you need
        to be within 100 feet of an ice cream shop to log a flavor.
      </p>

      <LogFlavorForm />
    </div>
  )
}

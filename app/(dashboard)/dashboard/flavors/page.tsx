import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import ConeDexBrowser from "@/components/flavor/conedex-browser"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default async function FlavorsPage() {
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

  // Get user's flavor logs count
  const { count } = await supabase
    .from("flavor_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My ConeDex</h1>
          <p className="text-muted-foreground">
            You've logged {count || 0} unique ice cream {count === 1 ? "flavor" : "flavors"} so far
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/log-flavor">
            <PlusCircle className="mr-2 h-4 w-4" />
            Log New Flavor
          </Link>
        </Button>
      </div>

      <ConeDexBrowser personalOnly={true} />
    </div>
  )
}

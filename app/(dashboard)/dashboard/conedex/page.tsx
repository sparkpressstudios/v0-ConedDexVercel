import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import ConeDexBrowser from "@/components/flavor/conedex-browser"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

// Demo user data
const demoUsers = {
  "admin@conedex.app": {
    email: "admin@conedex.app",
    role: "admin",
    id: "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
  },
  "shopowner@conedex.app": {
    email: "shopowner@conedex.app",
    role: "shop_owner",
    id: "f5c0d6e7-2e4b-5d7c-8f9a-1b2c3d4e5f6a",
  },
  "explorer@conedex.app": {
    email: "explorer@conedex.app",
    role: "explorer",
    id: "e4b9c5f8-1d3a-4c6b-9e2f-a8b7c6d5e4f3",
  },
}

export default async function PublicConeDexPage() {
  const supabase = createServerClient()

  // Check for demo user in cookies
  const cookieStore = cookies()
  const demoUserEmail = cookieStore.get("conedex_demo_user")?.value
  const isDemoUser = demoUserEmail && demoUsers[demoUserEmail as keyof typeof demoUsers]

  let session = null
  let count = 0

  // If not a demo user, get the real session and count
  if (!isDemoUser) {
    // Check if user is authenticated
    const sessionResponse = await supabase.auth.getSession()
    session = sessionResponse.data.session

    if (!session) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      }
    }

    // Get total flavors count
    const { count: flavorCount } = await supabase.from("flavors").select("*", { count: "exact", head: true })
    count = flavorCount || 0
  } else {
    // For demo users, provide a static count
    count = 42 // A reasonable number for demo purposes
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ConeDex</h1>
          <p className="text-muted-foreground">
            Explore {count} unique ice cream {count === 1 ? "flavor" : "flavors"} discovered by the community
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/log-flavor">
            <PlusCircle className="mr-2 h-4 w-4" />
            Log New Flavor
          </Link>
        </Button>
      </div>

      <ConeDexBrowser personalOnly={false} isDemoUser={!!isDemoUser} demoUserEmail={demoUserEmail} />
    </div>
  )
}

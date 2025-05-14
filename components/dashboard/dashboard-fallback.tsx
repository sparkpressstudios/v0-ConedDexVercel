import { Shell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { IceCream } from "lucide-react"
import Link from "next/link"

interface DashboardFallbackProps {
  error?: string
  title?: string
}

export function DashboardFallback({
  error = "We're having trouble loading your dashboard. This could be due to temporary service issues or missing configuration.",
  title = "Dashboard Unavailable",
}: DashboardFallbackProps) {
  return (
    <Shell layout="centered">
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="rounded-full bg-red-100 p-3 text-red-600 mb-4">
          <IceCream className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <div className="space-y-3 w-full max-w-xs">
          <Button asChild variant="default" className="w-full">
            <Link href="/dashboard">Refresh Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">Try Logging In Again</Link>
          </Button>
        </div>
      </div>
    </Shell>
  )
}

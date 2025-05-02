import Link from "next/link"
import { IceCream } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <IceCream className="h-16 w-16 text-pink-600" />
      <h1 className="mt-6 text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        Oops! Looks like this page has melted away. The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/shops">Find Shops</Link>
        </Button>
      </div>
    </div>
  )
}

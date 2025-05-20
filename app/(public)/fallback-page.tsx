import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shell } from "@/components/shell"

export default function FallbackPage() {
  return (
    <Shell layout="centered">
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="rounded-full bg-pink-100 p-3 text-pink-600 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18.15 15.15A7 7 0 0 0 9.5 3.5a7 7 0 0 0-1.76 13.77L7 22l5-1 5 1-.74-4.73a7 7 0 0 0 1.89-3.12Z"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome to ConeDex</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          The ultimate platform for ice cream lovers to discover and track their frozen adventures.
        </p>

        <div className="grid gap-4 md:grid-cols-2 w-full max-w-md">
          <Button asChild size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3 w-full max-w-3xl">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-2">Track Flavors</h3>
            <p className="text-sm text-muted-foreground">Log and rate all your ice cream discoveries.</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-2">Find Shops</h3>
            <p className="text-sm text-muted-foreground">Discover new ice cream shops near you.</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-2">Join Community</h3>
            <p className="text-sm text-muted-foreground">Connect with fellow ice cream enthusiasts.</p>
          </div>
        </div>
      </div>
    </Shell>
  )
}

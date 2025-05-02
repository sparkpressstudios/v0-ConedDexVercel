import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-pink-600" />
      <p className="mt-4 text-lg font-medium">Loading...</p>
    </div>
  )
}

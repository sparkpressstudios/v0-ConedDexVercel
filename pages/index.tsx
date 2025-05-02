"use client"

import { useEffect } from "react"
import { useRouter } from "next/router"

export default function PagesIndex() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the App Router version
    router.push("/dashboard")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to ConeDex...</h1>
        <p>Please wait while we redirect you to the main application.</p>
      </div>
    </div>
  )
}

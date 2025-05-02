"use client"

import { useEffect } from "react"
import { useRouter } from "next/router"

export default function AppRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.push("/")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to app...</p>
    </div>
  )
}

import type { Metadata } from "next"
import FallbackPage from "./fallback-page"

export const metadata: Metadata = {
  title: "ConeDex - The Ultimate Ice Cream Explorer",
  description: "Discover, track, and share your ice cream adventures with ConeDex.",
}

export default function HomePage() {
  // Use the fallback page to ensure something always renders
  return <FallbackPage />
}

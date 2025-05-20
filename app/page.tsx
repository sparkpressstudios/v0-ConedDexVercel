import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to the public home page
  redirect("/home")
}

import { redirect } from "next/navigation"
import { getUserRole } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  // Get the user's role
  const userRole = await getUserRole()

  // Redirect based on role
  if (userRole === "admin") {
    return redirect("/dashboard/admin")
  } else if (userRole === "shop_owner") {
    return redirect("/dashboard/shop")
  } else {
    return redirect("/dashboard/explorer")
  }
}

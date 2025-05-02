import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

export async function GET() {
  // Check if user is admin
  const session = await getSession()
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 403 })
  }

  // Create a CSV template with headers and example data
  const csvContent = `email,full_name,username,avatar_url,bio,location,update_if_exists
john.doe@example.com,John Doe,johndoe,https://example.com/avatar.jpg,"Ice cream enthusiast from Seattle","Seattle, WA",false
jane.smith@example.com,Jane Smith,janesmith,,"Loves trying new flavors","Portland, OR",true
robert.johnson@example.com,Robert Johnson,rjohnson,,"ConeDex power user","Chicago, IL",false`

  // Set the appropriate headers for a CSV file download
  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="user-import-template.csv"',
    },
  })
}

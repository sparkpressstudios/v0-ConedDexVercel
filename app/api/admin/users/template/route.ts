import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Generate a CSV template for user import
    const headers = ["email", "full_name", "username", "role", "team_id"]
    const exampleRow = ["user@example.com", "John Doe", "johndoe", "user", ""]

    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n")

    // Return the CSV as a downloadable file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="user-import-template.csv"',
      },
    })
  } catch (error) {
    console.error("Error generating template:", error)
    return NextResponse.json({ error: "Failed to generate template" }, { status: 500 })
  }
}

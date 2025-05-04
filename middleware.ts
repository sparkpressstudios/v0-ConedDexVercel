import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  try {
    // Skip middleware completely for the root route
    if (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "") {
      return NextResponse.next()
    }

    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Refresh session if needed
    await supabase.auth.getSession()

    // Fix for route group issues - ensure clean URLs
    // This needs to come before other logic to ensure proper redirects
    if (request.nextUrl.pathname.includes("/(")) {
      // Handle route group patterns like /(dashboard)/dashboard/flavors
      const cleanPath = request.nextUrl.pathname.replace(/\/$$[^)]+$$\//g, "/")

      // Rewrite to the clean path
      return NextResponse.rewrite(new URL(cleanPath, request.url))
    }

    // Handle route name confusion - redirect flavor-log to log-flavor
    if (
      request.nextUrl.pathname.includes("/flavor-log") ||
      request.nextUrl.pathname.includes("/(dashboard)/dashboard/flavor-log")
    ) {
      const correctedPath = request.nextUrl.pathname
        .replace("/flavor-log", "/log-flavor")
        .replace("/(dashboard)/dashboard/flavor-log", "/dashboard/log-flavor")

      return NextResponse.redirect(new URL(correctedPath, request.url))
    }

    // Handle authentication for protected routes
    if (
      request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.includes("/(dashboard)/dashboard")
    ) {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // Check for demo user in cookies
      const demoUserEmail = request.cookies.get("conedex_demo_user")?.value

      if (!session && !demoUserEmail) {
        // Redirect to login if not authenticated
        const redirectUrl = new URL("/login", request.url)
        redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // Return next response to prevent blocking the request
    return NextResponse.next()
  }
}

// Only run middleware on specific paths, exclude the root path explicitly
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     * - root path (/)
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|offline.html|$).*)",
  ],
}

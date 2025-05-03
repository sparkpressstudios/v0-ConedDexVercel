import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Refresh session if needed
    await supabase.auth.getSession()

    // Handle authentication for protected routes
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        // Redirect to login if not authenticated
        const redirectUrl = new URL("/login", request.url)
        redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Fix for route group issues - ensure clean URLs
    if (request.nextUrl.pathname.includes("/(dashboard)/dashboard")) {
      // Redirect to the correct URL without the route group
      const cleanPath = request.nextUrl.pathname.replace("/(dashboard)/dashboard", "/dashboard")
      return NextResponse.redirect(new URL(cleanPath, request.url))
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // Return next response to prevent blocking the request
    return NextResponse.next()
  }
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|offline.html).*)",
  ],
}

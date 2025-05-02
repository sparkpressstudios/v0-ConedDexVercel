import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname from the request
  const { pathname } = request.nextUrl

  // Check for demo user in cookies
  const demoUser = request.cookies.get("conedex_demo_user")?.value

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup", "/features", "/pricing", "/business", "/contact", "/sponsors"]

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // If the user is on a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If there's a demo user cookie, allow access
  if (demoUser) {
    // Admin routes
    if (pathname.startsWith("/dashboard/admin") && demoUser !== "admin@conedex.app") {
      const redirectUrl = new URL("/dashboard", request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Shop owner routes
    if (pathname.startsWith("/dashboard/shop") && demoUser !== "shopowner@conedex.app") {
      const redirectUrl = new URL("/dashboard", request.url)
      return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.next()
  }

  // For all other routes, check for auth token
  const authToken = request.cookies.get("sb-auth-token")?.value

  if (!authToken) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

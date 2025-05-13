import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  // Check if there's a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check for demo user cookie
  const demoUserEmail = request.cookies.get("conedex_demo_user")?.value

  // Get the pathname
  const { pathname } = request.nextUrl

  // Skip middleware for login and signup pages to avoid redirect loops
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return response
  }

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard"]

  // Admin-only routes
  const adminRoutes = ["/dashboard/admin"]

  // Shop owner routes
  const shopOwnerRoutes = ["/dashboard/shop"]

  // If accessing a protected route without authentication, redirect to login
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !session && !demoUserEmail) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If accessing admin routes, check for admin role
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    // For demo users, check the cookie
    if (demoUserEmail && demoUserEmail !== "admin@conedex.app") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // For authenticated users, check the role
    if (session && !demoUserEmail) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

      if (!profile || profile.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  }

  // If accessing shop owner routes, check for shop_owner role
  if (shopOwnerRoutes.some((route) => pathname.startsWith(route))) {
    // For demo users, check the cookie
    if (demoUserEmail && demoUserEmail !== "shopowner@conedex.app" && demoUserEmail !== "admin@conedex.app") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // For authenticated users, check the role
    if (session && !demoUserEmail) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

      if (!profile || (profile.role !== "shop_owner" && profile.role !== "admin")) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  }

  return response
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

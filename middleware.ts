import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware-client"

export async function middleware(request: NextRequest) {
  // Create a response object
  const response = NextResponse.next()

  try {
    // Create the Supabase middleware client
    const supabase = createMiddlewareSupabaseClient(request, response)

    // Check if the user is authenticated with Supabase
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Get the pathname from the request
    const { pathname } = request.nextUrl

    // Check for demo user in cookies
    const demoUser = request.cookies.get("conedex_demo_user")?.value

    // Public routes that don't require authentication
    const publicRoutes = [
      "/",
      "/login",
      "/signup",
      "/features",
      "/pricing",
      "/business",
      "/contact",
      "/sponsors",
      "/favicon.ico",
      "/_next",
      "/api/webhooks", // Allow webhook endpoints
    ]

    // Admin-only API routes that need special protection
    const adminApiRoutes = ["/api/admin/", "/api/admin/stripe/", "/api/admin/audit-logs/"]

    // Static assets and non-admin API routes
    const isStaticOrPublicApi =
      pathname.startsWith("/_next/") ||
      (pathname.startsWith("/api/") && !adminApiRoutes.some((route) => pathname.startsWith(route))) ||
      pathname.includes(".") // Files with extensions (images, etc.)

    // Check if the current path is a public route or starts with a public route
    const isPublicRoute =
      publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`)) || isStaticOrPublicApi

    // If the user is on a public route, allow access
    if (isPublicRoute) {
      return response
    }

    // Special handling for admin API routes - require admin session
    if (adminApiRoutes.some((route) => pathname.startsWith(route))) {
      // For API routes, we need to check if the user is an admin
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // Get user role from Supabase
      const { data: userData } = await supabase.from("users").select("role").eq("id", session.user.id).single()

      // If not admin, return unauthorized
      if (!userData || userData.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      // Admin is authorized, continue
      return response
    }

    // If the user is not authenticated and not a demo user, redirect to login
    if (!session && !demoUser) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // For demo users, handle role-based access
    if (demoUser && !session) {
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
    }

    // For authenticated users, check role-based access for admin routes
    if (session && pathname.startsWith("/dashboard/admin")) {
      // Get user role from Supabase
      const { data: userData } = await supabase.from("users").select("role").eq("id", session.user.id).single()

      // If not admin, redirect to dashboard
      if (!userData || userData.role !== "admin") {
        const redirectUrl = new URL("/dashboard", request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)

    // If there's an error, redirect to login with an error parameter
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("error", "auth")
    return NextResponse.redirect(redirectUrl)
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}

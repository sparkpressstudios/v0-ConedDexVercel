import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Check for demo user cookie as a fallback
    const demoUserCookie = req.cookies.get("conedex_demo_user")
    const hasDemoUser = !!demoUserCookie?.value

    // Consider either a real session or demo user as authenticated
    const isAuthenticated = !!session || hasDemoUser

    // Check auth condition
    const authPaths = ["/login", "/signup", "/forgot-password", "/reset-password"]
    const isAuthPath = authPaths.some((path) => req.nextUrl.pathname.startsWith(path))

    // Check dashboard condition
    const isDashboardPath = req.nextUrl.pathname.startsWith("/dashboard")

    // If accessing dashboard routes without auth, redirect to login
    if (isDashboardPath && !isAuthenticated) {
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If accessing auth routes with active session, redirect to dashboard
    if (isAuthPath && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)

    // If there's an error in the middleware, we should still allow the request to continue
    // This prevents the middleware from breaking the entire application
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"],
}

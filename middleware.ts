import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check auth condition
  const authPaths = ["/login", "/signup", "/forgot-password", "/reset-password"]
  const isAuthPath = authPaths.some((path) => req.nextUrl.pathname.startsWith(path))

  // Check dashboard condition
  const isDashboardPath = req.nextUrl.pathname.startsWith("/dashboard")

  // If accessing dashboard routes without auth, redirect to login
  if (isDashboardPath && !session) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If accessing auth routes with active session, redirect to dashboard
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"],
}

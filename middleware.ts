import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/landing", "/auth/callback"]
  const authRoutes = ["/auth/login", "/auth/sign-up"]

  // Allow public routes without authentication
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Handle authentication routes
  if (authRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // For all other routes, check authentication
  const response = await updateSession(request)

  // Add security headers
  const headers = new Headers(response.headers)
  headers.set("X-Frame-Options", "DENY")
  headers.set("X-Content-Type-Options", "nosniff")
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

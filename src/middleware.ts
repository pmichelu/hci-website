import { auth } from "@/lib/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !isLoggedIn
  ) {
    return Response.redirect(new URL("/admin/login", req.nextUrl))
  }

  if (pathname === "/admin/login" && isLoggedIn) {
    return Response.redirect(new URL("/admin", req.nextUrl))
  }
})

export const config = {
  matcher: ["/admin/:path*"],
}

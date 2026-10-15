import createMiddleware from "next-intl/middleware"

import { routing } from "@/i18n/routing"

// Phase 4 adds the auth cookie check for /dashboard and /account before this.
export default createMiddleware(routing)

export const config = {
  // Everything except API routes, Next.js internals, and files with an
  // extension (favicon.ico, robots.txt, images).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
}

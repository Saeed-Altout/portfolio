import { env } from "@/lib/env"

/** /design is a dev tool: always on in development, opt-in for production builds. */
export function isDesignPageEnabled(
  nodeEnv = process.env.NODE_ENV,
  designPage = env.DESIGN_PAGE
) {
  return nodeEnv !== "production" || designPage === "on"
}

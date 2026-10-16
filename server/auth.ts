import "server-only"

import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"

import { env } from "@/lib/env"

import { authOptions } from "./auth-options"
import { db } from "./db"

// Minimal for Phase 3 (schema only). Phase 4 adds email verification, the
// password reset and verification emails, and the admin/user/guest roles.
export const auth = betterAuth({
  ...authOptions,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: prismaAdapter(db, { provider: "postgresql" }),
  // nextCookies stays last.
  plugins: [...authOptions.plugins, nextCookies()],
})

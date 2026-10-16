import type { BetterAuthOptions } from "better-auth"
import { admin } from "better-auth/plugins"

/**
 * The Better Auth options that shape the database schema. Shared by
 * server/auth.ts and the schema generator (`npm run auth:schema`), which
 * cannot load server/auth.ts because of `server-only`. Keep secrets, the
 * database adapter, and email senders out of this file.
 */
export const authOptions = {
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      // Language for emails; the column is the Locale enum in schema.prisma.
      locale: { type: "string", required: false },
    },
  },
  rateLimit: { enabled: true, storage: "database" },
  plugins: [admin()],
} satisfies BetterAuthOptions

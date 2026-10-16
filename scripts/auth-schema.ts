// Config entry for `npm run auth:schema` (Better Auth's schema generator).
// It only needs the options that shape tables, so no database or secrets.
import { betterAuth } from "better-auth"

import { authOptions } from "../server/auth-options"

export const auth = betterAuth(authOptions)

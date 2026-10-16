import { randomBytes } from "node:crypto"

import { parse } from "dotenv"

/** Our variables, filled from `supabase status -o env` (its names on the right). */
export const localSupabaseMapping = {
  NEXT_PUBLIC_SUPABASE_URL: "API_URL",
  SUPABASE_URL: "API_URL",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "PUBLISHABLE_KEY",
  SUPABASE_SECRET_KEY: "SECRET_KEY",
  // No pooler locally, so the app and the CLI share the direct connection.
  DATABASE_URL: "DB_URL",
  DIRECT_URL: "DB_URL",
} as const

/** Maps `supabase status -o env` output to our variable names. */
export function localSupabaseValues(statusOutput: string) {
  const status = parse(statusOutput)
  const values: Record<string, string> = {}
  for (const [ours, theirs] of Object.entries(localSupabaseMapping)) {
    const value = status[theirs]
    if (!value) {
      throw new Error(
        `supabase status did not report ${theirs}. Is the stack running (npm run db:start)?`
      )
    }
    values[ours] = value
  }
  return values
}

/**
 * Sets `values` in a dotenv file's text. Existing lines keep their place and
 * comments; missing keys are appended. Other variables are left untouched.
 */
export function updateEnvText(text: string, values: Record<string, string>) {
  const pending = new Map(Object.entries(values))
  const lines = text.replace(/\r\n/g, "\n").split("\n")

  const updated = lines.map((line) => {
    const key = /^\s*([A-Z0-9_]+)\s*=/.exec(line)?.[1]
    if (!key || !pending.has(key)) return line
    const value = pending.get(key)
    pending.delete(key)
    return `${key}=${value}`
  })

  while (updated.length > 0 && updated.at(-1) === "") updated.pop()
  for (const [key, value] of pending) updated.push(`${key}=${value}`)
  return `${updated.join("\n")}\n`
}

/** A new Better Auth secret when the file has none: 32 random bytes. */
export function missingSecret(text: string): Record<string, string> {
  const current = parse(text).BETTER_AUTH_SECRET?.trim()
  return current
    ? {}
    : { BETTER_AUTH_SECRET: randomBytes(32).toString("base64") }
}

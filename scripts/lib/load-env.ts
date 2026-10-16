import { config } from "dotenv"

// Scripts read the same files as Next.js: .env.local wins over .env, and
// variables already set in the environment (CI, production) win over both.
// Import this before anything that reads process.env.
config({ path: [".env.local", ".env"], quiet: true })

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(
      `${name} is missing. Set it in .env.local (see .env.example).`
    )
  }
  return value
}

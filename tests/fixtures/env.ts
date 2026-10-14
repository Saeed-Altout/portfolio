/** A complete, valid environment for tests that import lib/env.ts. */
export const validEnv = {
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
  DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  DIRECT_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  BETTER_AUTH_SECRET: "x".repeat(32),
  BETTER_AUTH_URL: "http://localhost:3000",
  SUPABASE_URL: "http://127.0.0.1:54321",
  SUPABASE_SECRET_KEY: "sb_secret_test",
  RESEND_API_KEY: "",
  EMAIL_FROM: "",
  CONTACT_INBOX: "",
  TURNSTILE_SECRET_KEY: "",
  DESIGN_PAGE: "",
}

export type EnvOverrides = Partial<
  Record<keyof typeof validEnv | "NODE_ENV", string | undefined>
>

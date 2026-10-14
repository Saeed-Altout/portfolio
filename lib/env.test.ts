import { afterEach, describe, expect, it, vi } from "vitest"

const valid = {
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
}

type Overrides = Partial<Record<keyof typeof valid, string | undefined>>

/** Imports lib/env.ts fresh, so its startup validation runs against `overrides`. */
async function loadEnv(overrides: Overrides = {}) {
  for (const [key, value] of Object.entries({ ...valid, ...overrides })) {
    vi.stubEnv(key, value)
  }
  vi.resetModules()
  return import("./env")
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("lib/env", () => {
  it("parses a complete environment", async () => {
    const { env, clientEnv } = await loadEnv()

    expect(env.DATABASE_URL).toBe(valid.DATABASE_URL)
    expect(env.NEXT_PUBLIC_SITE_URL).toBe(valid.NEXT_PUBLIC_SITE_URL)
    expect(clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBe(
      "sb_publishable_test"
    )
  })

  it("treats empty optional variables as unset", async () => {
    const { env } = await loadEnv()

    expect(env.RESEND_API_KEY).toBeUndefined()
    expect(env.CONTACT_INBOX).toBeUndefined()
    expect(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY).toBeUndefined()
  })

  it("fails with a readable message when a variable is missing", async () => {
    await expect(loadEnv({ DATABASE_URL: undefined })).rejects.toThrow(
      [
        "Invalid server environment variables:",
        "  - DATABASE_URL is missing",
        "Set them in .env.local (see .env.example).",
      ].join("\n")
    )
  })

  it("treats an empty required variable as missing", async () => {
    await expect(loadEnv({ BETTER_AUTH_SECRET: "  " })).rejects.toThrow(
      "  - BETTER_AUTH_SECRET is missing"
    )
  })

  it("lists every invalid variable in one error", async () => {
    const error = await loadEnv({
      DIRECT_URL: "mysql://localhost/db",
      SUPABASE_SECRET_KEY: "sb_publishable_wrong_key",
      BETTER_AUTH_SECRET: "short",
    }).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe(
      [
        "Invalid server environment variables:",
        "  - DIRECT_URL must be a postgresql:// URL",
        "  - BETTER_AUTH_SECRET must be at least 32 characters (openssl rand -base64 32)",
        "  - SUPABASE_SECRET_KEY must be a Supabase secret key (sb_secret_...)",
        "Set them in .env.local (see .env.example).",
      ].join("\n")
    )
  })

  it("validates public variables separately", async () => {
    await expect(
      loadEnv({ NEXT_PUBLIC_SITE_URL: "localhost:3000" })
    ).rejects.toThrow(
      "Invalid client environment variables:\n  - NEXT_PUBLIC_SITE_URL must be an http:// or https:// URL"
    )
  })

  it("refuses server variables in the browser", async () => {
    vi.stubGlobal("window", {})
    const { env, clientEnv } = await loadEnv({
      SUPABASE_SECRET_KEY: undefined,
    })

    expect(clientEnv.NEXT_PUBLIC_SITE_URL).toBe(valid.NEXT_PUBLIC_SITE_URL)
    expect(() => env.SUPABASE_SECRET_KEY).toThrow(
      "env.SUPABASE_SECRET_KEY is server-only. Use clientEnv in client code."
    )
  })
})

import { describe, expect, it } from "vitest"

import { localSupabaseValues, missingSecret, updateEnvText } from "./env-file"

const status = [
  'API_URL="http://127.0.0.1:54321"',
  'DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"',
  'PUBLISHABLE_KEY="sb_publishable_local"',
  'SECRET_KEY="sb_secret_local"',
  'ANON_KEY="legacy"',
].join("\n")

describe("localSupabaseValues", () => {
  it("maps supabase status names to ours", () => {
    expect(localSupabaseValues(status)).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_local",
      SUPABASE_SECRET_KEY: "sb_secret_local",
      DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
      DIRECT_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    })
  })

  it("fails clearly when the stack is not running", () => {
    expect(() => localSupabaseValues('API_URL="x"')).toThrow(
      "supabase status did not report PUBLISHABLE_KEY. Is the stack running (npm run db:start)?"
    )
  })
})

describe("updateEnvText", () => {
  const file = [
    "# comment",
    "DATABASE_URL=old",
    "ADMIN_EMAIL=me@example.com",
    "",
    "SUPABASE_SECRET_KEY=",
    "",
  ].join("\n")

  it("replaces values in place and keeps everything else", () => {
    expect(
      updateEnvText(file, { DATABASE_URL: "new", SUPABASE_SECRET_KEY: "sb" })
    ).toBe(
      [
        "# comment",
        "DATABASE_URL=new",
        "ADMIN_EMAIL=me@example.com",
        "",
        "SUPABASE_SECRET_KEY=sb",
        "",
      ].join("\n")
    )
  })

  it("appends keys the file does not have", () => {
    expect(updateEnvText("A=1\n", { B: "2" })).toBe("A=1\nB=2\n")
  })

  it("normalizes Windows line endings", () => {
    expect(updateEnvText("A=1\r\nB=2\r\n", { A: "3" })).toBe("A=3\nB=2\n")
  })
})

describe("missingSecret", () => {
  it("creates a 32-byte secret when none is set", () => {
    const { BETTER_AUTH_SECRET } = missingSecret("BETTER_AUTH_SECRET=\n")
    expect(Buffer.from(BETTER_AUTH_SECRET ?? "", "base64")).toHaveLength(32)
  })

  it("keeps an existing secret", () => {
    expect(missingSecret("BETTER_AUTH_SECRET=kept\n")).toEqual({})
  })
})

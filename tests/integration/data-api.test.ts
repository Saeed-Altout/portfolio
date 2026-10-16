import { describe, expect, it } from "vitest"

import { requireEnv } from "../../scripts/lib/load-env"

// Probes Supabase's REST endpoint (PostgREST) the way an outsider would, with
// the publishable key that ships to every browser.
const restUrl = `${requireEnv("SUPABASE_URL")}/rest/v1`

async function read(table: string, key: string) {
  const response = await fetch(`${restUrl}/${table}?select=*&limit=1`, {
    headers: { apikey: key },
  })
  const body = (await response.json()) as { code?: string }
  return { status: response.status, code: body.code }
}

describe("Supabase Data API", () => {
  it("is reachable with the publishable key", async () => {
    const response = await fetch(`${restUrl}/`, {
      headers: { apikey: requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") },
    })
    expect(response.status).toBe(200)
  })

  it("cannot read the user table with the publishable key", async () => {
    const result = await read(
      "user",
      requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
    )
    // 42501 = permission denied: refused by the grants, not by a bad request.
    expect(result).toMatchObject({ code: "42501" })
    expect(result.status).toBeGreaterThanOrEqual(400)
  })

  it("cannot read app tables even with the secret key", async () => {
    for (const table of ["user", "Post", "Message"]) {
      const result = await read(table, requireEnv("SUPABASE_SECRET_KEY"))
      expect(result, table).toMatchObject({ code: "42501" })
    }
  })
})

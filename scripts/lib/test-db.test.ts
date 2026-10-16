import { describe, expect, it } from "vitest"

import { testDatabaseUrl } from "./test-db"

describe("testDatabaseUrl", () => {
  it("points the same server at portfolio_test", () => {
    expect(
      testDatabaseUrl("postgresql://postgres:secret@127.0.0.1:54322/postgres")
    ).toBe("postgresql://postgres:secret@127.0.0.1:54322/portfolio_test")
  })

  it("keeps query parameters", () => {
    expect(
      testDatabaseUrl("postgres://u:p@db.example.com:5432/app?sslmode=require")
    ).toBe("postgres://u:p@db.example.com:5432/portfolio_test?sslmode=require")
  })
})

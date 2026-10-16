import pg from "pg"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

// Supabase's Data API roles. Prisma connects as the owner (postgres).
const dataApiRoles = ["anon", "authenticated", "service_role"]

const databases = {
  // The database PostgREST serves, with Supabase's default grants.
  dev: process.env.DEV_DATABASE_URL,
  test: process.env.DATABASE_URL,
}

describe.each(Object.entries(databases))("%s database", (_, url) => {
  const client = new pg.Client({ connectionString: url })

  beforeAll(() => client.connect())
  afterAll(() => client.end())

  it("has the migrated tables", async () => {
    const { rows } = await client.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
    )
    const tables = rows.map((row) => row.tablename)
    expect(tables).toEqual(
      expect.arrayContaining(["user", "session", "Post", "Media", "Setting"])
    )
  })

  it("enables row level security on every table", async () => {
    const { rows } = await client.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity"
    )
    expect(rows.map((row) => row.tablename)).toEqual([])
  })

  it("gives the Data API roles no privilege on any table or sequence", async () => {
    const { rows } = await client.query<{ role: string; name: string }>(
      `SELECT r.rolname AS role, c.relname AS name
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       CROSS JOIN pg_roles r
       WHERE n.nspname = 'public'
         AND r.rolname = ANY($1)
         AND (
           (c.relkind IN ('r', 'p', 'v', 'm') AND has_table_privilege(
             r.oid, c.oid, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER'))
           OR (c.relkind = 'S' AND has_sequence_privilege(
             r.oid, c.oid, 'USAGE, SELECT, UPDATE'))
         )`,
      [dataApiRoles]
    )
    expect(rows).toEqual([])
  })

  it("locks out tables created later", async () => {
    await client.query("CREATE TABLE public.hardening_probe (id int)")
    try {
      const { rows } = await client.query<{ role: string }>(
        `SELECT rolname AS role FROM pg_roles
         WHERE rolname = ANY($1)
           AND has_table_privilege(rolname, 'public.hardening_probe', 'SELECT')`,
        [dataApiRoles]
      )
      expect(rows).toEqual([])
    } finally {
      await client.query("DROP TABLE public.hardening_probe")
    }
  })
})

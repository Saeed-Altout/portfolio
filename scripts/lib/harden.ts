import pg from "pg"

/**
 * Locks Supabase's Data API out of the app's tables. Prisma connects as the
 * table owner (postgres), which bypasses RLS, while the API roles must see
 * nothing: RLS on with no policies, and every privilege revoked, now and for
 * tables created later. service_role is included too: the app never uses the
 * Data API, so a leaked secret key cannot read tables through it either.
 * Safe to run any number of times.
 */
export const hardeningSql = `
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated, service_role;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated, service_role;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated, service_role;
`

export async function hardenDatabase(connectionString: string) {
  const client = new pg.Client({ connectionString })
  await client.connect()
  try {
    await client.query(hardeningSql)
  } finally {
    await client.end()
  }
}

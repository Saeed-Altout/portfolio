import { beforeAll } from "vitest"

import { requireEnv } from "../../scripts/lib/load-env"
import { testDatabaseUrl, truncateAllTables } from "../../scripts/lib/test-db"

// Every integration file talks to portfolio_test. The dev database stays
// reachable as DEV_DATABASE_URL for read-only checks of Supabase's own
// configuration (its default grants exist only there).
const devUrl = requireEnv("DIRECT_URL")
const testUrl = testDatabaseUrl(devUrl)
process.env.DEV_DATABASE_URL = devUrl
process.env.DATABASE_URL = testUrl
process.env.DIRECT_URL = testUrl

beforeAll(async () => {
  await truncateAllTables(testUrl)
})

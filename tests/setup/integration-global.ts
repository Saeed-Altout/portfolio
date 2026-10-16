import { requireEnv } from "../../scripts/lib/load-env"
import { prepareTestDatabase } from "../../scripts/lib/test-db"

// Once per run: create, migrate, and harden portfolio_test.
export default async function setup() {
  await prepareTestDatabase(requireEnv("DIRECT_URL"))
}

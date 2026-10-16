import { requireEnv } from "./lib/load-env"
import { prepareTestDatabase, testDatabaseName } from "./lib/test-db"

await prepareTestDatabase(requireEnv("DIRECT_URL"))
console.log(`${testDatabaseName}: migrated and hardened`)

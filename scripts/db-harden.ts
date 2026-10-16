import { hardenDatabase } from "./lib/harden"
import { requireEnv } from "./lib/load-env"

await hardenDatabase(requireEnv("DIRECT_URL"))
console.log("database hardened: RLS on, Data API roles revoked")

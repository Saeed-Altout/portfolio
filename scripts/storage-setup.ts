import { requireEnv } from "./lib/load-env"
import { setupBuckets, storageAdmin } from "./lib/storage"

const supabase = storageAdmin(
  requireEnv("SUPABASE_URL"),
  requireEnv("SUPABASE_SECRET_KEY")
)

for (const { id, action } of await setupBuckets(supabase)) {
  console.log(`bucket ${id}: ${action}`)
}

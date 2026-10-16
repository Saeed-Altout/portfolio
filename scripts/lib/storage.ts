import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { buckets, type BucketId } from "@/lib/storage-buckets"

/** A Supabase client for scripts and tests, authorized by the secret key. */
export function storageAdmin(url: string, secretKey: string): SupabaseClient {
  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Creates each bucket, or updates it to the current rules if it exists. */
export async function setupBuckets(supabase: SupabaseClient) {
  const results: Array<{ id: BucketId; action: "created" | "updated" }> = []

  for (const [id, rules] of Object.entries(buckets) as Array<
    [BucketId, (typeof buckets)[BucketId]]
  >) {
    const options = {
      public: rules.public,
      fileSizeLimit: rules.fileSizeLimit,
      allowedMimeTypes: [...rules.allowedMimeTypes],
    }
    const { data: existing } = await supabase.storage.getBucket(id)
    const { error } = existing
      ? await supabase.storage.updateBucket(id, options)
      : await supabase.storage.createBucket(id, options)
    if (error) throw new Error(`Bucket ${id}: ${error.message}`)
    results.push({ id, action: existing ? "updated" : "created" })
  }

  return results
}

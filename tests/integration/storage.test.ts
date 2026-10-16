import { createClient } from "@supabase/supabase-js"
import { afterAll, describe, expect, it } from "vitest"

import { buckets, type BucketId } from "@/lib/storage-buckets"

import { requireEnv } from "../../scripts/lib/load-env"
import { setupBuckets, storageAdmin } from "../../scripts/lib/storage"

const url = requireEnv("SUPABASE_URL")
const admin = storageAdmin(url, requireEnv("SUPABASE_SECRET_KEY"))
// What a browser has: the publishable key and a signed upload token.
const browser = createClient(
  url,
  requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  { auth: { persistSession: false } }
)

const prefix = `__integration__/${Date.now()}`
const uploaded: Array<{ bucket: BucketId; path: string }> = []

// A 1×1 transparent PNG.
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
)

/** Uploads like a browser: the server signs, the browser sends the bytes. */
async function signedUpload(
  bucket: BucketId,
  name: string,
  body: Buffer,
  contentType: string
) {
  const path = `${prefix}/${name}`
  const signed = await admin.storage.from(bucket).createSignedUploadUrl(path)
  if (signed.error) throw signed.error
  uploaded.push({ bucket, path })
  return browser.storage
    .from(bucket)
    .uploadToSignedUrl(path, signed.data.token, body, { contentType })
}

afterAll(async () => {
  for (const bucket of Object.keys(buckets) as BucketId[]) {
    const paths = uploaded
      .filter((file) => file.bucket === bucket)
      .map((file) => file.path)
    if (paths.length > 0) await admin.storage.from(bucket).remove(paths)
  }
})

describe("storage buckets", () => {
  it("storage:setup runs twice and leaves the plan's rules", async () => {
    await setupBuckets(admin)
    const second = await setupBuckets(admin)
    expect(second.map((result) => result.action)).toEqual([
      "updated",
      "updated",
      "updated",
    ])

    for (const [id, rules] of Object.entries(buckets)) {
      const { data, error } = await admin.storage.getBucket(id)
      expect(error).toBeNull()
      expect(data).toMatchObject({
        public: rules.public,
        file_size_limit: rules.fileSizeLimit,
        allowed_mime_types: [...rules.allowedMimeTypes],
      })
    }
  })

  it("accepts a signed upload and serves public media", async () => {
    const { data, error } = await signedUpload(
      "media",
      "pixel.png",
      png,
      "image/png"
    )
    expect(error).toBeNull()

    const publicUrl = admin.storage.from("media").getPublicUrl(data!.path)
    const response = await fetch(publicUrl.data.publicUrl)
    expect(response.status).toBe(200)
  })

  it("rejects a type the bucket does not allow", async () => {
    for (const contentType of ["text/plain", "image/svg+xml"]) {
      const { error } = await signedUpload(
        "media",
        `bad-${contentType.replace("/", "-")}`,
        Buffer.from("<svg/>"),
        contentType
      )
      expect(error, contentType).not.toBeNull()
    }
  })

  it("rejects a file over the bucket's size limit", async () => {
    const tooBig = Buffer.alloc(buckets.avatars.fileSizeLimit + 1)
    const { error } = await signedUpload(
      "avatars",
      "too-big.png",
      tooBig,
      "image/png"
    )
    expect(error).not.toBeNull()
  })

  it("serves documents only through a signed URL", async () => {
    const path = `${prefix}/notes.pdf`
    const upload = await admin.storage
      .from("documents")
      .upload(path, Buffer.from("%PDF-1.4\n"), {
        contentType: "application/pdf",
      })
    uploaded.push({ bucket: "documents", path })
    expect(upload.error).toBeNull()

    const unsigned = admin.storage.from("documents").getPublicUrl(path)
    expect((await fetch(unsigned.data.publicUrl)).ok).toBe(false)

    const signed = await admin.storage
      .from("documents")
      .createSignedUrl(path, 60)
    expect(signed.error).toBeNull()
    expect((await fetch(signed.data!.signedUrl)).status).toBe(200)
  })
})

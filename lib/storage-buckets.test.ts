import { describe, expect, it } from "vitest"

import { buckets } from "./storage-buckets"

const MiB = 1024 * 1024

describe("storage buckets", () => {
  it("match the plan's sizes and visibility", () => {
    expect(buckets.media).toMatchObject({
      public: true,
      fileSizeLimit: 5 * MiB,
    })
    expect(buckets.avatars).toMatchObject({
      public: true,
      fileSizeLimit: 1 * MiB,
    })
    expect(buckets.documents).toMatchObject({
      public: false,
      fileSizeLimit: 50 * MiB,
    })
  })

  it("never allow SVG in a public bucket", () => {
    for (const [id, rules] of Object.entries(buckets)) {
      if (!rules.public) continue
      expect(rules.allowedMimeTypes, id).not.toContain("image/svg+xml")
      expect(
        rules.allowedMimeTypes.every((type) => type.startsWith("image/"))
      ).toBe(true)
    }
  })
})

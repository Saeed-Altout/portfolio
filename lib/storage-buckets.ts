const MiB = 1024 * 1024

export type BucketRules = {
  public: boolean
  fileSizeLimit: number
  allowedMimeTypes: readonly string[]
}

/**
 * Storage buckets, created by `npm run storage:setup`. Files are stored as
 * <entity>/<yyyy>/<mm>/<id>.<ext>. There are no storage policies: browsers
 * upload only to signed URLs the server creates, and private files are served
 * only through signed download URLs. SVG is never allowed in a public bucket,
 * because it can carry scripts.
 */
export const buckets = {
  // Covers, post images, and social image overrides.
  media: {
    public: true,
    fileSizeLimit: 5 * MiB,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  },
  avatars: {
    public: true,
    fileSizeLimit: 1 * MiB,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  // CV, thesis, course notes and slides.
  documents: {
    public: false,
    fileSizeLimit: 50 * MiB,
    allowedMimeTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  },
} as const satisfies Record<string, BucketRules>

export type BucketId = keyof typeof buckets

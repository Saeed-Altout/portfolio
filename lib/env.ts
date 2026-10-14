import { z } from "zod"

const httpUrl = z.url({
  protocol: /^https?$/,
  error: "must be an http:// or https:// URL",
})

const postgresUrl = z.url({
  protocol: /^postgres(ql)?$/,
  error: "must be a postgresql:// URL",
})

/** Variables the browser may see. Next.js inlines them at build time. */
export const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: httpUrl,
  NEXT_PUBLIC_SUPABASE_URL: httpUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .startsWith("sb_publishable_", {
      error: "must be a Supabase publishable key (sb_publishable_...)",
    }),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
})

/** Variables that must never reach the browser. */
export const serverSchema = z.object({
  DATABASE_URL: postgresUrl,
  DIRECT_URL: postgresUrl,
  BETTER_AUTH_SECRET: z.string().min(32, {
    error: "must be at least 32 characters (openssl rand -base64 32)",
  }),
  BETTER_AUTH_URL: httpUrl,
  SUPABASE_URL: httpUrl,
  SUPABASE_SECRET_KEY: z.string().startsWith("sb_secret_", {
    error: "must be a Supabase secret key (sb_secret_...)",
  }),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  CONTACT_INBOX: z.email({ error: "must be an email address" }).optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  // The dev-only /design page; "on" also serves it from a production build.
  DESIGN_PAGE: z
    .enum(["on", "off"], { error: 'must be "on" or "off"' })
    .optional(),
})

export type ClientEnv = z.infer<typeof clientSchema>
export type ServerEnv = z.infer<typeof serverSchema> & ClientEnv

type EnvSource = Record<string, string | undefined>

/**
 * Validates `source` against `schema`. Empty values count as missing, so an
 * unfilled line copied from .env.example fails the same way as a missing one.
 * Throws one error that lists every invalid variable.
 */
export function parseEnv<T extends z.ZodObject>(
  schema: T,
  source: EnvSource,
  label: string
): z.infer<T> {
  const values: EnvSource = {}
  for (const key of Object.keys(schema.shape)) {
    const value = source[key]?.trim()
    values[key] = value === "" ? undefined : value
  }

  const result = schema.safeParse(values)
  if (result.success) return result.data

  const lines = result.error.issues.map((issue) => {
    const key = String(issue.path[0])
    const reason = values[key] === undefined ? "is missing" : issue.message
    return `  - ${key} ${reason}`
  })
  throw new Error(
    [
      `Invalid ${label} environment variables:`,
      ...lines,
      "Set them in .env.local (see .env.example).",
    ].join("\n")
  )
}

const isServer = typeof window === "undefined"

/**
 * Public variables, safe in client components. Each one is read by its full
 * name so Next.js can inline it into the browser bundle.
 */
export const clientEnv: ClientEnv = parseEnv(
  clientSchema,
  {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  },
  "client"
)

/**
 * Every variable, for server code only. In the browser any read throws, so a
 * leaked import fails loudly instead of returning undefined.
 */
export const env: ServerEnv = isServer
  ? { ...parseEnv(serverSchema, process.env, "server"), ...clientEnv }
  : new Proxy({} as ServerEnv, {
      get(_, key) {
        throw new Error(
          `env.${String(key)} is server-only. Use clientEnv in client code.`
        )
      },
    })

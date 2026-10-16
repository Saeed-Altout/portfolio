import { config } from "dotenv"
import { defineConfig, env } from "prisma/config"

// Prisma 7 does not read .env files itself. .env.local wins over .env, and
// variables already set in the environment (CI, production) win over both.
config({ path: [".env.local", ".env"], quiet: true })

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // The CLI uses the direct connection; the app uses the pooled DATABASE_URL.
  datasource: { url: env("DIRECT_URL") },
})

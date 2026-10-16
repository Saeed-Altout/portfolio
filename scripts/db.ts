import { hardenDatabase } from "./lib/harden"
import { requireEnv } from "./lib/load-env"
import { run } from "./lib/run"

// npm run db:migrate -- --name <name>   (dev: create and apply a migration)
// npm run db:deploy                      (CI and production: apply migrations)
// Both harden the database afterwards, so new tables are locked down too.
const [mode, ...args] = process.argv.slice(2)

if (mode === "migrate") {
  run("npx", ["prisma", "migrate", "dev", ...args])
  run("npx", ["prisma", "generate"])
} else if (mode === "deploy") {
  run("npx", ["prisma", "migrate", "deploy", ...args])
} else {
  throw new Error(`Unknown mode "${mode}". Use "migrate" or "deploy".`)
}

await hardenDatabase(requireEnv("DIRECT_URL"))
console.log("database hardened: RLS on, Data API roles revoked")

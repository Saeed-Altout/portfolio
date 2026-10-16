import { existsSync, readFileSync, writeFileSync } from "node:fs"

import {
  localSupabaseValues,
  missingSecret,
  updateEnvText,
} from "./lib/env-file"
import { capture } from "./lib/run"

// Writes the local Supabase URLs and keys into .env.local (created from
// .env.example if missing). Other variables keep their values. Never prints
// a value, only the names it set.
const status = capture("npx", ["supabase", "status", "-o", "env"])
const current = existsSync(".env.local")
  ? readFileSync(".env.local", "utf8")
  : readFileSync(".env.example", "utf8")

const values = { ...localSupabaseValues(status), ...missingSecret(current) }
writeFileSync(".env.local", updateEnvText(current, values))

console.log(`.env.local updated: ${Object.keys(values).join(", ")}`)

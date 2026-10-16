import "server-only"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "@/generated/prisma/client"
import { env } from "@/lib/env"

// One client per process. In development, hot reloads would otherwise open a
// new connection pool on every change.
const globalForDb = globalThis as unknown as { db?: PrismaClient }

export const db =
  globalForDb.db ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  })

if (process.env.NODE_ENV !== "production") globalForDb.db = db

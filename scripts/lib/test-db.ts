import pg from "pg"

import { hardenDatabase } from "./harden"
import { run } from "./run"

export const testDatabaseName = "portfolio_test"

/** The same server and credentials as `url`, pointed at the test database. */
export function testDatabaseUrl(url: string) {
  const parsed = new URL(url)
  parsed.pathname = `/${testDatabaseName}`
  return parsed.toString()
}

/**
 * Creates the test database if it is missing, applies every migration, and
 * hardens it like the real one. Safe to run any number of times.
 */
export async function prepareTestDatabase(directUrl: string) {
  const client = new pg.Client({ connectionString: directUrl })
  await client.connect()
  try {
    const { rowCount } = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [testDatabaseName]
    )
    if (!rowCount) await client.query(`CREATE DATABASE "${testDatabaseName}"`)
  } finally {
    await client.end()
  }

  const testUrl = testDatabaseUrl(directUrl)
  run("npx", ["prisma", "migrate", "deploy"], {
    env: { ...process.env, DIRECT_URL: testUrl },
  })
  await hardenDatabase(testUrl)
  return testUrl
}

/** Empties every app table, keeping the migration history. */
export async function truncateAllTables(url: string) {
  const client = new pg.Client({ connectionString: url })
  await client.connect()
  try {
    const { rows } = await client.query<{ tablename: string }>(
      `SELECT tablename FROM pg_tables
       WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`
    )
    if (rows.length > 0) {
      const tables = rows
        .map(({ tablename }) => `public."${tablename}"`)
        .join(", ")
      await client.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`)
    }
  } finally {
    await client.end()
  }
}

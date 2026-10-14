import { defineConfig, devices } from "@playwright/test"

const port = 3100
const baseURL = `http://localhost:${port}`
const isCI = !!process.env.CI

/**
 * End-to-end tests run against a production build. Every run builds fresh, so
 * the gate never tests a stale server. Locale only sets the browser language
 * for now; Phase 2 adds the /ar and /en routes the projects are named after.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "ar-light",
      use: { ...devices["Desktop Chrome"], locale: "ar", colorScheme: "light" },
    },
    {
      name: "ar-dark",
      use: { ...devices["Desktop Chrome"], locale: "ar", colorScheme: "dark" },
    },
    {
      name: "en-light",
      use: { ...devices["Desktop Chrome"], locale: "en", colorScheme: "light" },
    },
    {
      name: "en-dark",
      use: { ...devices["Desktop Chrome"], locale: "en", colorScheme: "dark" },
    },
    {
      name: "ar-mobile",
      use: { ...devices["Pixel 7"], locale: "ar", colorScheme: "light" },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 300_000,
  },
})

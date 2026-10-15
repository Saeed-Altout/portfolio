import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const serverOnlyStub = fileURLToPath(
  new URL("./node_modules/server-only/empty.js", import.meta.url)
)

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    // `server-only` throws outside the react-server condition; tests import
    // server modules directly, so it resolves to the package's empty module.
    alias: [{ find: /^server-only$/, replacement: serverOnlyStub }],
  },
  test: {
    exclude: ["**/node_modules/**", "**/.next/**", "tests/e2e/**"],
    // next-intl imports "next/navigation" without an extension, which Node's
    // ESM resolver rejects; Vite's resolver handles it.
    server: { deps: { inline: ["next-intl"] } },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["**/*.test.ts"],
          exclude: [
            "**/node_modules/**",
            "**/.next/**",
            "tests/e2e/**",
            "tests/integration/**",
          ],
        },
      },
      {
        extends: true,
        test: {
          name: "component",
          environment: "jsdom",
          include: ["**/*.test.tsx"],
          setupFiles: ["tests/setup/component.ts"],
        },
      },
    ],
  },
})

import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Locale-aware navigation only: links and redirects must keep /ar or /en.
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/link",
              message: "Use Link from @/i18n/navigation.",
            },
            {
              name: "next/navigation",
              importNames: [
                "redirect",
                "permanentRedirect",
                "useRouter",
                "usePathname",
              ],
              message: "Use the locale-aware version from @/i18n/navigation.",
            },
          ],
        },
      ],
    },
  },
  {
    // Rule 7: visible text comes from messages/*.json, never JSX literals.
    files: ["app/**/*.tsx", "components/**/*.tsx"],
    ignores: ["**/*.test.tsx"],
    rules: {
      "react/jsx-no-literals": ["error", { allowedStrings: ["."] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated output and vendored agent skills:
    "generated/**",
    "coverage/**",
    "test-results/**",
    "playwright-report/**",
    "blob-report/**",
    ".claude/skills/**",
  ]),
])

export default eslintConfig

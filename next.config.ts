import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

// Validates every environment variable at startup, so dev, build, and start
// fail early with a readable list instead of breaking at first use.
import "./lib/env"

const nextConfig: NextConfig = {
  experimental: {
    // The root layout is app/[locale]/layout.tsx, so URLs outside a locale
    // (e.g. /unknown.txt) get app/global-not-found.tsx.
    globalNotFound: true,
  },
}

// Points next-intl at i18n/request.ts.
const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig)

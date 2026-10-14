import type { NextConfig } from "next"

// Validates every environment variable at startup, so dev, build, and start
// fail early with a readable list instead of breaking at first use.
import "./lib/env"

const nextConfig: NextConfig = {}

export default nextConfig

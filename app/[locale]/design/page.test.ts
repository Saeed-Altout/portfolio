import { afterEach, describe, expect, it, vi } from "vitest"

import { validEnv, type EnvOverrides } from "@/tests/fixtures/env"

// The e2e server always turns the page on, so the production guard is tested
// here. lib/env.ts validates on import, so each case imports fresh.
async function load<T>(path: string, overrides: EnvOverrides = {}): Promise<T> {
  for (const [key, value] of Object.entries({ ...validEnv, ...overrides })) {
    vi.stubEnv(key, value)
  }
  vi.resetModules()
  return import(/* @vite-ignore */ path) as Promise<T>
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("/design guard", () => {
  it.each([
    ["development", undefined, true],
    ["test", undefined, true],
    ["production", undefined, false],
    ["production", "off", false],
    ["production", "on", true],
  ] as const)("NODE_ENV=%s, DESIGN_PAGE=%s → %s", async (nodeEnv, flag, on) => {
    const { isDesignPageEnabled } =
      await load<typeof import("./enabled")>("./enabled")

    expect(isDesignPageEnabled(nodeEnv, flag)).toBe(on)
  })

  it("returns not found from a production build by default", async () => {
    const { default: DesignPage } = await load<typeof import("./page")>(
      "./page",
      { NODE_ENV: "production" }
    )

    await expect(DesignPage()).rejects.toMatchObject({
      digest: "NEXT_HTTP_ERROR_FALLBACK;404",
    })
  })
})

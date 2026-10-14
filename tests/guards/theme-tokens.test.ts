import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

// Rule 4: the preset's color and radius tokens are frozen. Only font
// variables may change. Editing any other token fails this snapshot.
const css = readFileSync(
  new URL("../../app/globals.css", import.meta.url),
  "utf8"
)

/** Returns the custom properties declared directly inside `selector { ... }`. */
function declarations(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`)
  if (start === -1)
    throw new Error(`${selector} block not found in globals.css`)
  const end = css.indexOf("}", start)
  const block = css.slice(start + selector.length + 2, end)

  const tokens: Record<string, string> = {}
  for (const match of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    const [, name, value] = match
    if (name && value) tokens[name] = value.replace(/\s+/g, " ").trim()
  }
  return tokens
}

function withoutFonts(tokens: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(tokens).filter(([name]) => !name.startsWith("--font-"))
  )
}

describe("theme tokens", () => {
  it("keeps the light theme tokens", () => {
    expect(declarations(":root")).toMatchSnapshot()
  })

  it("keeps the dark theme tokens", () => {
    expect(declarations(".dark")).toMatchSnapshot()
  })

  it("keeps the Tailwind color and radius mappings", () => {
    expect(withoutFonts(declarations("@theme inline"))).toMatchSnapshot()
  })

  it("finds every token block", () => {
    expect(Object.keys(declarations(":root")).length).toBeGreaterThan(30)
    expect(Object.keys(declarations(".dark")).length).toBeGreaterThan(30)
    expect(declarations(":root")).toHaveProperty("--radius")
  })
})

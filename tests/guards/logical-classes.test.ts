import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

// Rule 6: physical direction utilities break the Arabic (RTL) layout. Use
// ms/me/ps/pe/start/end/text-start instead. A line ending in a `rtl-ok`
// comment is a reviewed exception.
const root = join(import.meta.dirname, "..", "..")
const scannedDirs = ["app", "components", "features"]
const extensions = [".ts", ".tsx", ".css"]

// One class token: everything up to whitespace, a quote, or a backtick.
const token = String.raw`[^\s"'\x60]+`

const physicalUtility = new RegExp(
  [
    // A class token starts the line or follows whitespace, a quote, a
    // backtick, or a variant colon; "-" allows negative values.
    String.raw`(?<=^|[\s"'\x60:])!?-?`,
    "(?:",
    [
      String.raw`(?:m|p|scroll-m|scroll-p)[lr]-${token}`,
      String.raw`(?:left|right)-${token}`,
      String.raw`(?:border|rounded)-[lr](?:-${token})?`,
      String.raw`rounded-(?:tl|tr|bl|br)(?:-${token})?`,
      String.raw`(?:text|float|clear)-(?:left|right)`,
      String.raw`origin-(?:top-|bottom-)?(?:left|right)`,
    ].join("|"),
    ")",
    String.raw`(?=$|[\s"'\x60])`,
  ].join(""),
  "g"
)

function sourceFiles(dir: string): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return []
  }
  return entries.flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return extensions.some((extension) => path.endsWith(extension))
      ? [path]
      : []
  })
}

/** Lists `file:line  class` for every physical utility outside a reviewed line. */
function findPhysicalClasses(files: string[]): string[] {
  const findings: string[] = []
  for (const file of files) {
    const lines = readFileSync(file, "utf8").split("\n")
    lines.forEach((line, index) => {
      if (/rtl-ok/.test(line)) return
      for (const match of line.matchAll(physicalUtility)) {
        findings.push(`${relative(root, file)}:${index + 1}  ${match[0]}`)
      }
    })
  }
  return findings
}

describe("logical classes only", () => {
  it("flags physical utilities and skips reviewed lines", () => {
    const sample = [
      `<div className="ml-2 pr-4 text-left md:right-0 -mr-1" />`,
      `<div className="ms-2 pe-4 text-start end-0 margin-left" />`,
      `<div className="border-l-2 rounded-tr-md" /> // rtl-ok`,
      `const side = "left"; data-[side=left]:slide-in-from-left-10`,
    ]
    const matches = sample.flatMap((line) =>
      /rtl-ok/.test(line)
        ? []
        : [...line.matchAll(physicalUtility)].map((match) => match[0])
    )

    expect(matches).toEqual(["ml-2", "pr-4", "text-left", "right-0", "-mr-1"])
  })

  it("finds no physical utilities in app, components, or features", () => {
    const files = scannedDirs.flatMap((dir) => sourceFiles(join(root, dir)))
    expect(files.length).toBeGreaterThan(0)

    const findings = findPhysicalClasses(files)
    expect(findings, `Use logical classes:\n${findings.join("\n")}`).toEqual([])
  })
})

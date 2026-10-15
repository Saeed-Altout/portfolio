import { describe, expect, it } from "vitest"

import ar from "./ar.json"
import en from "./en.json"

type Tree = { [key: string]: string | Tree }

/** Flattens nested messages into "namespace.key" → message. */
function flatten(tree: Tree, prefix = ""): Map<string, string> {
  const entries = new Map<string, string>()
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === "string") entries.set(path, value)
    else for (const entry of flatten(value, path)) entries.set(...entry)
  }
  return entries
}

/** Top-level ICU argument names, e.g. "{count, plural, ...}" → count. */
function argumentNames(message: string): string[] {
  const names = new Set<string>()
  let depth = 0
  for (let index = 0; index < message.length; index++) {
    const char = message[index]
    if (char === "{") {
      if (depth === 0) {
        const name = /^\{\s*([\w]+)/.exec(message.slice(index))?.[1]
        if (name) names.add(name)
      }
      depth++
    } else if (char === "}") {
      depth--
    }
  }
  return [...names].sort()
}

const locales = { ar: flatten(ar), en: flatten(en) }

describe("messages", () => {
  it("has the same keys in ar.json and en.json", () => {
    const arKeys = [...locales.ar.keys()].sort()
    const enKeys = [...locales.en.keys()].sort()

    expect(arKeys.filter((key) => !locales.en.has(key))).toEqual([])
    expect(enKeys.filter((key) => !locales.ar.has(key))).toEqual([])
  })

  it("has no empty messages", () => {
    for (const [locale, entries] of Object.entries(locales)) {
      const empty = [...entries].filter(([, value]) => value.trim() === "")
      expect(empty.map(([key]) => `${locale}: ${key}`)).toEqual([])
    }
  })

  it("uses the same ICU arguments in both languages", () => {
    const mismatched = [...locales.en]
      .filter(
        ([key, value]) =>
          argumentNames(value).join() !==
          argumentNames(locales.ar.get(key) ?? "").join()
      )
      .map(([key]) => key)

    expect(mismatched).toEqual([])
  })
})

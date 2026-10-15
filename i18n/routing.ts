import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  // /ar/... and /en/...: explicit share links and clean hreflang.
  localePrefix: "always",
  // "/" always opens Arabic; the browser's language is not consulted.
  localeDetection: false,
})

export function localeDirection(locale: string): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr"
}

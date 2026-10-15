import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"
import { notFound } from "next/navigation"
import * as rootParams from "next/root-params"

import { formats, timeZone } from "./formats"
import { routing } from "./routing"

export default getRequestConfig(async ({ locale: explicitLocale }) => {
  // Root params are not available in Server Actions and Route Handlers yet;
  // those pass the locale explicitly, e.g. getTranslations({ locale }).
  const locale = explicitLocale ?? (await rootParams.locale())
  if (!hasLocale(routing.locales, locale)) notFound()

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone,
    formats,
  }
})

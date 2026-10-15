"use client"

import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Link, usePathname } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

/**
 * Links to the same page in the other language. A link, not a button, so it
 * works without JavaScript and crawlers see the alternate version.
 */
function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations("common")
  const otherLocale =
    routing.locales.find((candidate) => candidate !== locale) ??
    routing.defaultLocale

  return (
    <Button asChild variant="outline">
      <Link
        href={pathname}
        locale={otherLocale}
        lang={otherLocale}
        hrefLang={otherLocale}
      >
        {t("otherLanguage")}
      </Link>
    </Button>
  )
}

export { LocaleSwitcher }

import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import "./globals.css"
import { fontClassName } from "@/app/fonts"
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { H1, Muted } from "@/components/ui/typography"
import { localeDirection, routing } from "@/i18n/routing"

export const metadata: Metadata = {
  title: "404",
  robots: { index: false },
}

// For URLs that match no locale route (e.g. /unknown.txt). There is no locale
// here, so the page shows every language, Arabic first.
export default async function GlobalNotFound() {
  const versions = await Promise.all(
    routing.locales.map(async (locale) => ({
      locale,
      t: await getTranslations({ locale, namespace: "notFound" }),
    }))
  )

  return (
    <html
      lang={routing.defaultLocale}
      dir={localeDirection(routing.defaultLocale)}
      suppressHydrationWarning
      className={fontClassName}
    >
      <body>
        <ThemeProvider>
          <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center gap-8 px-4">
            {versions.map(({ locale, t }, index) => (
              <section
                key={locale}
                lang={locale}
                dir={localeDirection(locale)}
                className="flex flex-col items-start gap-4"
              >
                {index > 0 && <Separator className="mb-4" />}
                {index === 0 ? (
                  <H1>{t("title")}</H1>
                ) : (
                  <H1 asChild>
                    <p>{t("title")}</p>
                  </H1>
                )}
                <Muted>{t("description")}</Muted>
                <Button asChild variant="outline">
                  <a href={`/${locale}`}>{t("backHome")}</a>
                </Button>
              </section>
            ))}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}

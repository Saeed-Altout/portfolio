import type { Metadata } from "next"
import { NextIntlClientProvider, type Messages } from "next-intl"
import { getLocale, getMessages, getTranslations } from "next-intl/server"

import "../globals.css"
import { fontClassName } from "@/app/fonts"
import { ThemeProvider } from "@/components/theme-provider"
import { DirectionProvider } from "@/components/ui/direction"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { localeDirection, routing } from "@/i18n/routing"

// Only these namespaces reach the browser; everything else is rendered on
// the server. Client components may use nothing outside this list.
const clientNamespaces = ["common", "validation"] as const satisfies Array<
  keyof Messages
>

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// Any other first segment (e.g. /unknown.txt) matches no route, so Next.js
// serves app/global-not-found.tsx. Without this, [locale] would accept it and
// i18n/request.ts would 404 inside the root layout, which renders a blank
// page. Cache Components (Phase 5) forbids this export; see docs/decisions.md.
export const dynamicParams = false

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("seo")

  return {
    title: { default: t("siteName"), template: `%s | ${t("siteName")}` },
    description: t("description"),
  }
}

export default async function LocaleLayout({
  children,
}: LayoutProps<"/[locale]">) {
  const locale = await getLocale()
  const dir = localeDirection(locale)
  const messages = await getMessages()
  const t = await getTranslations("common")

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={fontClassName}
    >
      <body>
        <NextIntlClientProvider
          messages={Object.fromEntries(
            clientNamespaces.map((namespace) => [
              namespace,
              messages[namespace],
            ])
          )}
        >
          <DirectionProvider dir={dir}>
            <ThemeProvider>
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster
                dir={dir}
                position={dir === "rtl" ? "bottom-left" : "bottom-right"}
                containerAriaLabel={t("notifications")}
              />
            </ThemeProvider>
          </DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

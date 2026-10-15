import { useTranslations } from "next-intl"

import { LocaleSwitcher } from "@/components/layout/locale-switcher"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { Link } from "@/i18n/navigation"

// The minimal shell for Phase 2. Phase 7 adds navigation, the account menu,
// and the mobile sheet.
function SiteHeader() {
  const t = useTranslations("seo")

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-heading text-lg font-semibold">
          {t("siteName")}
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

export { SiteHeader }

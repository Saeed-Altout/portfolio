import { ArrowRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { H1, Muted } from "@/components/ui/typography"
import { Link } from "@/i18n/navigation"

export default function NotFound() {
  const t = useTranslations("notFound")

  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col items-start justify-center gap-4 px-4">
      <H1>{t("title")}</H1>
      <Muted>{t("description")}</Muted>
      <Button asChild variant="outline">
        <Link href="/">
          {t("backHome")}
          <ArrowRightIcon data-icon="inline-end" className="rtl:rotate-180" />
        </Link>
      </Button>
    </main>
  )
}

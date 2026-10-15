import { useTranslations } from "next-intl"

import { H1, Lead } from "@/components/ui/typography"

// A placeholder until Phase 7 builds the home page from Settings and content.
export default function HomePage() {
  const t = useTranslations("home")

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-24">
      <H1>{t("title")}</H1>
      <Lead>{t("lead")}</Lead>
    </main>
  )
}

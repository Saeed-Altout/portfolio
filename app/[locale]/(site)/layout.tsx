import { SiteHeader } from "@/components/layout/site-header"

export default function SiteLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  )
}

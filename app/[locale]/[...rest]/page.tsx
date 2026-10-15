import { notFound } from "next/navigation"

// Overrides the layout's dynamicParams = false: this route exists to accept
// every unknown path under a locale.
export const dynamicParams = true

// Unknown paths under a locale (/ar/whatever) render the localized
// app/[locale]/not-found.tsx inside the root layout.
export default function UnknownPage() {
  notFound()
}

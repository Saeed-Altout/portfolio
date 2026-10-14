import type { Metadata } from "next"
import { Cairo, Geist_Mono, Poppins } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DirectionProvider } from "@/components/ui/direction"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Poppins has no Arabic glyphs, so the browser takes Latin letters from
// Poppins and Arabic letters from Cairo. --font-sans in globals.css names
// "Poppins" directly instead of using --font-poppins (see the note there).
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// Placeholder until Phase 2 moves titles into messages/*.json.
export const metadata: Metadata = {
  title: "Portfolio",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={cn(
        "font-sans antialiased",
        poppins.variable,
        cairo.variable,
        fontMono.variable
      )}
    >
      <body>
        <DirectionProvider dir="ltr">
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster />
          </ThemeProvider>
        </DirectionProvider>
      </body>
    </html>
  )
}

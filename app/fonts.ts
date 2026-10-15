import { Cairo, Geist_Mono, Poppins } from "next/font/google"

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

/** Classes for <html>: the font variables plus the default sans stack. */
export const fontClassName = cn(
  "font-sans antialiased",
  poppins.variable,
  cairo.variable,
  fontMono.variable
)

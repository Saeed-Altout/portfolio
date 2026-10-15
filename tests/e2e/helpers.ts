import AxeBuilder from "@axe-core/playwright"
import type { Page } from "@playwright/test"

/** The site language a Playwright project covers: ar-light → "ar". */
export function projectLang(projectName: string): "ar" | "en" {
  return projectName.startsWith("ar") ? "ar" : "en"
}

/** Collects console errors and uncaught exceptions, including hydration errors. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(error.message))
  return errors
}

/** Serious and critical axe violations, with the offending elements. */
export async function seriousViolations(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).analyze()
  return violations
    .filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical"
    )
    .map(
      (violation) =>
        `${violation.id}: ${violation.help} → ${violation.nodes
          .map(
            (node) => `${node.target.join(" ")} ${node.failureSummary ?? ""}`
          )
          .join(" | ")}`
    )
}

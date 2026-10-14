import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test("home page loads without errors", async ({ page }) => {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(error.message))

  const response = await page.goto("/")

  expect(response?.status()).toBe(200)
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  expect(errors).toEqual([])
})

test("home page has no serious accessibility issues", async ({ page }) => {
  await page.goto("/")

  const { violations } = await new AxeBuilder({ page }).analyze()
  const serious = violations.filter(
    (violation) =>
      violation.impact === "serious" || violation.impact === "critical"
  )

  expect(serious.map((violation) => violation.id)).toEqual([])
})

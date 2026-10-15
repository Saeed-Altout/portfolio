import { expect, test } from "@playwright/test"

import { collectErrors, projectLang, seriousViolations } from "./helpers"

test("home page loads without errors", async ({ page }, testInfo) => {
  const errors = collectErrors(page)

  const response = await page.goto(`/${projectLang(testInfo.project.name)}`)

  expect(response?.status()).toBe(200)
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  expect(errors).toEqual([])
})

test("home page screenshot for review", async ({ page }, testInfo) => {
  await page.goto(`/${projectLang(testInfo.project.name)}`)
  await page.evaluate(() => document.fonts.ready)

  await page.screenshot({
    path: `test-results/screenshots/${testInfo.project.name}-home.jpeg`,
    type: "jpeg",
    quality: 80,
  })
})

test("home page has no serious accessibility issues", async ({
  page,
}, testInfo) => {
  await page.goto(`/${projectLang(testInfo.project.name)}`)

  expect(await seriousViolations(page)).toEqual([])
})

import { expect, test } from "@playwright/test"

test("/ redirects to /ar", async ({ page }) => {
  const response = await page.goto("/")

  expect(response?.status()).toBe(200)
  expect(new URL(page.url()).pathname).toBe("/ar")
})

test("Arabic is right to left and English is left to right", async ({
  page,
}) => {
  const html = page.locator("html")

  await page.goto("/ar")
  await expect(html).toHaveAttribute("lang", "ar")
  await expect(html).toHaveAttribute("dir", "rtl")

  await page.goto("/en")
  await expect(html).toHaveAttribute("lang", "en")
  await expect(html).toHaveAttribute("dir", "ltr")
})

test("the language switcher keeps the path", async ({ page }) => {
  await page.goto("/ar/design")

  await page.getByRole("link", { name: "English" }).click()
  await expect(page).toHaveURL(/\/en\/design$/)
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr")

  await page.getByRole("link", { name: "العربية" }).click()
  await expect(page).toHaveURL(/\/ar\/design$/)
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl")
})

test("an unknown locale returns 404", async ({ page }) => {
  const response = await page.goto("/fr/anything")

  expect(response?.status()).toBe(404)
})

test("an unknown page shows the 404 in its language", async ({ page }) => {
  const arabic = await page.goto("/ar/no-such-page")
  expect(arabic?.status()).toBe(404)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "الصفحة غير موجودة"
  )
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl")

  const english = await page.goto("/en/no-such-page")
  expect(english?.status()).toBe(404)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page not found"
  )
})

test("a URL outside every locale shows the global 404", async ({ page }) => {
  const response = await page.goto("/unknown.txt")

  expect(response?.status()).toBe(404)
  await expect(page.getByText("الصفحة غير موجودة")).toBeVisible()
  await expect(page.getByText("Page not found")).toBeVisible()
})

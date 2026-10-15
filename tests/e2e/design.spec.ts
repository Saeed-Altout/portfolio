import { expect, test, type Page } from "@playwright/test"

import { collectErrors, projectLang, seriousViolations } from "./helpers"

/** Font families Chromium actually used to draw the text inside `selector`. */
async function renderedFonts(page: Page, selector: string) {
  await page.evaluate(() => document.fonts.ready)
  const cdp = await page.context().newCDPSession(page)
  await cdp.send("DOM.enable")
  await cdp.send("CSS.enable")
  const { root } = await cdp.send("DOM.getDocument")
  const { nodeId } = await cdp.send("DOM.querySelector", {
    nodeId: root.nodeId,
    selector,
  })
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId })
  await cdp.detach()
  return fonts.map((font) => font.familyName).sort()
}

test.describe("/design", () => {
  test("renders in the project's language and direction", async ({
    page,
  }, testInfo) => {
    const lang = projectLang(testInfo.project.name)
    const errors = collectErrors(page)
    await page.goto(`/${lang}/design`)

    const html = page.locator("html")
    await expect(html).toHaveAttribute("lang", lang)
    await expect(html).toHaveAttribute("dir", lang === "ar" ? "rtl" : "ltr")

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    )
    expect(overflow, "page scrolls sideways").toBe(0)
    expect(errors).toEqual([])
  })

  test("has no serious accessibility issues", async ({ page }, testInfo) => {
    await page.goto(`/${projectLang(testInfo.project.name)}/design`)

    expect(await seriousViolations(page)).toEqual([])
  })

  test("renders Arabic in Cairo and Latin in Poppins", async ({ page }) => {
    await page.goto("/ar/design")

    for (const selector of ["body", "h1"]) {
      const family = await page
        .locator(selector)
        .first()
        .evaluate((element) => getComputedStyle(element).fontFamily)
      expect(family, `${selector} font-family`).toMatch(/Poppins.*Cairo/)
    }

    // Arabic letters come from Cairo. Spaces come from Poppins, the first font
    // in the stack with a space glyph. No system fallback font draws anything.
    expect(await renderedFonts(page, "h1")).toEqual(["Cairo", "Poppins"])
    expect(
      await renderedFonts(page, "article [data-variant='p']"),
      "Arabic paragraph with Latin terms such as MAX30102"
    ).toEqual(["Cairo", "Poppins"])

    await page.goto("/en/design")
    expect(await renderedFonts(page, "h1")).toEqual(["Poppins"])
    // A single Arabic word, the language switch, uses Cairo alone.
    expect(await renderedFonts(page, "a[hreflang='ar']")).toEqual(["Cairo"])
  })

  test("styles rich text with the article preset", async ({
    page,
  }, testInfo) => {
    const lang = projectLang(testInfo.project.name)
    await page.goto(`/${lang}/design`)

    const paragraph = page.locator(".typeset-article > p").first()
    const { fontSize, lineHeight } = await paragraph.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
      }
    })

    // 17px on wide screens; Typeset scales it by 1.125 below 48rem.
    const isNarrow = (testInfo.project.use.viewport?.width ?? 1280) < 768
    expect(fontSize).toBeCloseTo(isNarrow ? 17 * 1.125 : 17, 1)
    // Arabic lines are taller: 2.0 instead of 1.85.
    expect(lineHeight / fontSize).toBeCloseTo(lang === "ar" ? 2 : 1.85, 2)
  })

  test.describe("formatting", () => {
    // A browser far from Damascus: the shared time zone must still apply.
    test.use({ timezoneId: "America/Los_Angeles" })

    test("matches between server and browser, with Western digits", async ({
      page,
    }, testInfo) => {
      const lang = projectLang(testInfo.project.name)
      const errors = collectErrors(page)
      await page.goto(`/${lang}/design`)

      for (const kind of ["date", "number", "percent"]) {
        const row = page.locator(`tr[data-format="${kind}"]`)
        const server = await row.locator("[data-source='server']").innerText()
        await expect(row.locator("[data-source='client']")).toHaveText(server)
      }

      const date = page.locator("tr[data-format='date'] [data-source='server']")
      await expect(date).toHaveText(
        lang === "ar" ? "7 أكتوبر 2026" : "October 7, 2026"
      )
      await expect(
        page.locator("tr[data-format='plural'] [data-source='server']")
      ).toHaveText(lang === "ar" ? "3 تنزيلات" : "3 downloads")

      const text = await page.getByRole("main").innerText()
      expect(text, "Arabic-Indic digits").not.toMatch(/[٠-٩۰-۹]/)
      expect(errors, "hydration or console errors").toEqual([])
    })
  })

  test("switches themes with no flash on reload", async ({
    page,
  }, testInfo) => {
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        document.documentElement.dataset.themeAtLoad =
          document.documentElement.className
      })
    })
    await page.goto("/en/design")
    const html = page.locator("html")
    const toggle = page.getByRole("button", { name: "Toggle theme" })

    for (const theme of ["dark", "light"] as const) {
      await toggle.click()
      await page
        .getByRole("menuitemradio", { name: theme, exact: false })
        .click()
      await expect(html).toHaveClass(new RegExp(`\\b${theme}\\b`))

      await page.reload()
      // The class is already set when the HTML finishes parsing, before
      // React hydrates, so the first paint uses the chosen theme.
      await expect(html).toHaveAttribute(
        "data-theme-at-load",
        new RegExp(`\\b${theme}\\b`)
      )
    }

    await toggle.click()
    await page.getByRole("menuitemradio", { name: "System" }).click()
    const system =
      testInfo.project.use.colorScheme === "dark" ? "dark" : "light"
    await expect(html).toHaveClass(new RegExp(`\\b${system}\\b`))
  })

  test("screenshot for review", async ({ page }, testInfo) => {
    await page.goto(`/${projectLang(testInfo.project.name)}/design`)
    await page.evaluate(() => document.fonts.ready)

    await page.screenshot({
      path: `test-results/screenshots/${testInfo.project.name}-design.jpeg`,
      fullPage: true,
      type: "jpeg",
      quality: 80,
    })
  })
})

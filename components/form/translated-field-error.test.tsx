import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it } from "vitest"
import { z } from "zod"

import type { ValidationKey } from "@/i18n/keys"
import ar from "@/messages/ar.json"
import en from "@/messages/en.json"

import { TranslatedFieldError } from "./translated-field-error"

// One schema for client and server: it carries message keys, not sentences.
const schema = z.object({
  email: z.email({ error: "validation.email" satisfies ValidationKey }),
})

function renderIn(
  locale: "ar" | "en",
  errors: Array<{ message?: string } | undefined>
) {
  return render(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === "ar" ? ar : en}
    >
      <TranslatedFieldError errors={errors} />
    </NextIntlClientProvider>
  )
}

describe("TranslatedFieldError", () => {
  const result = schema.safeParse({ email: "saeed@" })
  const issues = result.success ? [] : result.error.issues

  it("gets a message key from the shared Zod schema", () => {
    expect(issues.map((issue) => issue.message)).toEqual(["validation.email"])
  })

  it("shows the key in English", () => {
    renderIn("en", issues)
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a valid email address."
    )
  })

  it("shows the key in Arabic", () => {
    renderIn("ar", issues)
    expect(screen.getByRole("alert")).toHaveTextContent(
      "أدخل بريدًا إلكترونيًا صحيحًا."
    )
  })

  it("never shows a raw message that is not a key", () => {
    renderIn("en", [{ message: "Invalid input: expected string" }])
    expect(screen.getByRole("alert")).toHaveTextContent("Check this value.")
  })

  it("renders nothing without errors", () => {
    const { container } = renderIn("en", [])
    expect(container).toBeEmptyDOMElement()
  })
})

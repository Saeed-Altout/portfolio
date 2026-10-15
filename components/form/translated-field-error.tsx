import { useTranslations } from "next-intl"

import { FieldError } from "@/components/ui/field"
import type { ValidationKey } from "@/i18n/keys"

type ErrorWithKey = { message?: string } | undefined

function isValidationKey(message: string): message is ValidationKey {
  return message.startsWith("validation.")
}

/**
 * FieldError for Zod and server errors whose message is a key such as
 * "validation.email". Anything that is not a known key shows the generic
 * "validation.invalid" text, so a raw English message never reaches the page.
 */
function TranslatedFieldError({
  errors,
  ...props
}: Omit<React.ComponentProps<typeof FieldError>, "errors" | "children"> & {
  errors?: ErrorWithKey[]
}) {
  const t = useTranslations()

  const translated = errors?.filter(Boolean).map((error) => {
    const key = error?.message
    return {
      message:
        key && isValidationKey(key) && t.has(key)
          ? t(key)
          : t("validation.invalid"),
    }
  })

  return <FieldError errors={translated} {...props} />
}

export { TranslatedFieldError }

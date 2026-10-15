"use client"

import { useFormatter } from "next-intl"

import { formattingSample, type FormattingKind } from "./formatting-sample"

/** Formats a sample value in the browser, with the formats and time zone the server sent. */
function ClientFormatted({ kind }: { kind: FormattingKind }) {
  const format = useFormatter()

  if (kind === "date") {
    return format.dateTime(new Date(formattingSample.date), "long")
  }
  if (kind === "number") {
    return format.number(formattingSample.number, "decimal")
  }
  return format.number(formattingSample.percent, "percent")
}

export { ClientFormatted }

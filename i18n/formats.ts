import type { Formats } from "next-intl"

export const timeZone = "Asia/Damascus"

// Every shared format pins Western digits, so model numbers and metrics read
// the same in Arabic and English whatever the locale's default digits are.
export const formats = {
  dateTime: {
    short: {
      day: "numeric",
      month: "short",
      year: "numeric",
      numberingSystem: "latn",
    },
    long: {
      day: "numeric",
      month: "long",
      year: "numeric",
      numberingSystem: "latn",
    },
    monthYear: { month: "long", year: "numeric", numberingSystem: "latn" },
  },
  number: {
    integer: { maximumFractionDigits: 0, numberingSystem: "latn" },
    decimal: { maximumFractionDigits: 2, numberingSystem: "latn" },
    percent: {
      style: "percent",
      maximumFractionDigits: 1,
      numberingSystem: "latn",
    },
  },
} satisfies Formats

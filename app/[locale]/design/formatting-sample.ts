// Fixed inputs, so server and browser format the same values. 22:30 UTC is
// already the next day in Damascus, which proves the shared time zone applies.
export const formattingSample = {
  date: "2026-10-06T22:30:00Z",
  number: 1234.5,
  percent: 0.973,
  count: 3,
}

export type FormattingKind = "date" | "number" | "percent"

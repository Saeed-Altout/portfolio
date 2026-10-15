import type { MessageKeys, Messages, NestedKeyOf } from "next-intl"

/** Any full message key, e.g. "validation.email". */
export type MessageKey = MessageKeys<Messages, NestedKeyOf<Messages>>

/**
 * A key Zod schemas use as their error. Schemas carry keys, never sentences,
 * so the same schema works on the client and the server in both languages.
 */
export type ValidationKey = Extract<MessageKey, `validation.${string}`>

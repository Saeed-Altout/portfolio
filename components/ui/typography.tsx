import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

// From the shadcn Typography examples, with logical classes for RTL.
// Arabic is a cursive script: letter-spacing breaks its joins and a synthetic
// italic slants it, so both are reset under :lang(ar).
const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 font-heading text-4xl font-extrabold tracking-tight text-balance [&:lang(ar)]:tracking-normal",
      h2: "scroll-m-20 border-b pb-2 font-heading text-3xl font-semibold tracking-tight first:mt-0 [&:lang(ar)]:tracking-normal",
      h3: "scroll-m-20 font-heading text-2xl font-semibold tracking-tight [&:lang(ar)]:tracking-normal",
      h4: "scroll-m-20 font-heading text-xl font-semibold tracking-tight [&:lang(ar)]:tracking-normal",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm leading-none font-medium",
      muted: "text-sm text-muted-foreground",
      blockquote: "mt-6 border-s-2 ps-6 italic [&:lang(ar)]:not-italic",
      list: "my-6 ms-6 list-disc [&>li]:mt-2",
      inlineCode:
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
    },
  },
})

type TypographyVariant = NonNullable<
  VariantProps<typeof typographyVariants>["variant"]
>

type TypographyProps<T extends React.ElementType> = React.ComponentProps<T> & {
  asChild?: boolean
}

function typographyProps(variant: TypographyVariant, className?: string) {
  return {
    "data-slot": "typography",
    "data-variant": variant,
    className: cn(typographyVariants({ variant }), className),
  }
}

function H1({ className, asChild = false, ...props }: TypographyProps<"h1">) {
  const Comp = asChild ? Slot.Root : "h1"
  return <Comp {...typographyProps("h1", className)} {...props} />
}

function H2({ className, asChild = false, ...props }: TypographyProps<"h2">) {
  const Comp = asChild ? Slot.Root : "h2"
  return <Comp {...typographyProps("h2", className)} {...props} />
}

function H3({ className, asChild = false, ...props }: TypographyProps<"h3">) {
  const Comp = asChild ? Slot.Root : "h3"
  return <Comp {...typographyProps("h3", className)} {...props} />
}

function H4({ className, asChild = false, ...props }: TypographyProps<"h4">) {
  const Comp = asChild ? Slot.Root : "h4"
  return <Comp {...typographyProps("h4", className)} {...props} />
}

function P({ className, asChild = false, ...props }: TypographyProps<"p">) {
  const Comp = asChild ? Slot.Root : "p"
  return <Comp {...typographyProps("p", className)} {...props} />
}

function Lead({ className, asChild = false, ...props }: TypographyProps<"p">) {
  const Comp = asChild ? Slot.Root : "p"
  return <Comp {...typographyProps("lead", className)} {...props} />
}

function Large({
  className,
  asChild = false,
  ...props
}: TypographyProps<"div">) {
  const Comp = asChild ? Slot.Root : "div"
  return <Comp {...typographyProps("large", className)} {...props} />
}

function Small({
  className,
  asChild = false,
  ...props
}: TypographyProps<"small">) {
  const Comp = asChild ? Slot.Root : "small"
  return <Comp {...typographyProps("small", className)} {...props} />
}

function Muted({ className, asChild = false, ...props }: TypographyProps<"p">) {
  const Comp = asChild ? Slot.Root : "p"
  return <Comp {...typographyProps("muted", className)} {...props} />
}

function Blockquote({
  className,
  asChild = false,
  ...props
}: TypographyProps<"blockquote">) {
  const Comp = asChild ? Slot.Root : "blockquote"
  return <Comp {...typographyProps("blockquote", className)} {...props} />
}

function List({ className, asChild = false, ...props }: TypographyProps<"ul">) {
  const Comp = asChild ? Slot.Root : "ul"
  return <Comp {...typographyProps("list", className)} {...props} />
}

function InlineCode({
  className,
  asChild = false,
  ...props
}: TypographyProps<"code">) {
  const Comp = asChild ? Slot.Root : "code"
  return <Comp {...typographyProps("inlineCode", className)} {...props} />
}

export {
  Blockquote,
  H1,
  H2,
  H3,
  H4,
  InlineCode,
  Large,
  Lead,
  List,
  Muted,
  P,
  Small,
  typographyVariants,
}

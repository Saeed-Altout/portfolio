import type { Metadata } from "next"
import { getFormatter, getLocale, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import {
  ArrowRightIcon,
  CircleCheckIcon,
  FileTextIcon,
  LinkIcon,
  MenuIcon,
} from "lucide-react"

import { TranslatedFieldError } from "@/components/form/translated-field-error"
import { LocaleSwitcher } from "@/components/layout/locale-switcher"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
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
} from "@/components/ui/typography"
import { Link } from "@/i18n/navigation"
import { localeDirection, routing } from "@/i18n/routing"

import { ClientFormatted } from "./client-formatted"
import { isDesignPageEnabled } from "./enabled"
import { formattingSample, type FormattingKind } from "./formatting-sample"
import { ToastButton } from "./toast-button"

const typographyList = ["calibrate", "compare", "document"] as const
const cardItems = ["oximeter", "booking"] as const
const richTextList = ["error", "battery", "cost"] as const
const tableRows = ["rest", "pulse"] as const
const tableColumns = ["metric", "prototype", "reference"] as const
const formattingKinds: FormattingKind[] = ["date", "number", "percent"]
const navItems = ["home", "projects", "blog"] as const

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("design")
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  }
}

/** Dev-only showcase of every building block, used for review screenshots. */
export default async function DesignPage() {
  if (!isDesignPageEnabled()) notFound()

  const locale = await getLocale()
  const dir = localeDirection(locale)
  const otherLocale =
    routing.locales.find((candidate) => candidate !== locale) ??
    routing.defaultLocale
  const t = await getTranslations("design")
  const format = await getFormatter()

  const serverFormatted: Record<FormattingKind, string> = {
    date: format.dateTime(new Date(formattingSample.date), "long"),
    number: format.number(formattingSample.number, "decimal"),
    percent: format.number(formattingSample.percent, "percent"),
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-16 px-4 py-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <H1>{t("title")}</H1>
          <Muted>{t("description")}</Muted>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ModeToggle />
        </div>
      </header>

      <Section id="typography" title={t("sections.typography")}>
        <article>
          <H1 asChild>
            <p>{t("typography.h1")}</p>
          </H1>
          <Lead className="mt-4">{t("typography.lead")}</Lead>
          <H2 className="mt-10">{t("typography.h2")}</H2>
          <P>{t("typography.p")}</P>
          <H3 className="mt-8">{t("typography.h3")}</H3>
          <P>
            {t("typography.formulaLabel")}{" "}
            <InlineCode dir="ltr">{t("typography.formula")}</InlineCode>.
          </P>
          <H4 className="mt-8">{t("typography.h4")}</H4>
          <Blockquote>{t("typography.blockquote")}</Blockquote>
          <List>
            {typographyList.map((key) => (
              <li key={key}>{t(`typography.list.${key}`)}</li>
            ))}
          </List>
        </article>
        <div className="flex flex-col gap-3">
          <Large>{t("typography.large")}</Large>
          <Small>{t("typography.small")}</Small>
          <Muted>{t("typography.muted")}</Muted>
        </div>
      </Section>

      <Section id="buttons" title={t("sections.buttons")}>
        <div className="flex flex-wrap items-center gap-3">
          <Button>{t("buttons.primary")}</Button>
          <Button variant="secondary">{t("buttons.secondary")}</Button>
          <Button variant="outline">{t("buttons.outline")}</Button>
          <Button variant="ghost">{t("buttons.ghost")}</Button>
          <Button variant="destructive">{t("buttons.destructive")}</Button>
          <Button variant="link">{t("buttons.link")}</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">{t("buttons.primary")}</Button>
          <Button size="lg">{t("buttons.primary")}</Button>
          <Button disabled>
            <Spinner data-icon="inline-start" />
            {t("buttons.loading")}
          </Button>
          <Button variant="outline">
            {t("buttons.next")}
            <ArrowRightIcon data-icon="inline-end" className="rtl:rotate-180" />
          </Button>
        </div>
      </Section>

      <Section id="badges" title={t("sections.badges")}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{t("badges.published")}</Badge>
          <Badge variant="secondary">{t("badges.draft")}</Badge>
          <Badge variant="outline">{t("badges.archived")}</Badge>
          <Badge variant="destructive">{t("badges.rejected")}</Badge>
        </div>
      </Section>

      <Section id="forms" title={t("sections.forms")}>
        <form className="max-w-md">
          <FieldSet>
            <FieldLegend>{t("form.legend")}</FieldLegend>
            <FieldDescription>{t("form.description")}</FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="design-name">{t("form.name")}</FieldLabel>
                <Input
                  id="design-name"
                  placeholder={t("form.namePlaceholder")}
                />
              </Field>
              <Field data-invalid>
                <FieldLabel htmlFor="design-email">
                  {t("form.email")}
                </FieldLabel>
                <Input
                  id="design-email"
                  type="email"
                  dir="ltr"
                  defaultValue={t("form.emailInvalidValue")}
                  aria-invalid
                  aria-describedby="design-email-error"
                />
                {/* The error is a message key, as a Zod schema would give it. */}
                <TranslatedFieldError
                  id="design-email-error"
                  errors={[{ message: "validation.email" }]}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="design-message">
                  {t("form.message")}
                </FieldLabel>
                <Textarea
                  id="design-message"
                  placeholder={t("form.messagePlaceholder")}
                />
                <FieldDescription>{t("form.messageHint")}</FieldDescription>
              </Field>
              <Field orientation="horizontal">
                <Button type="button">{t("form.submit")}</Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </Section>

      <Section id="cards" title={t("sections.cards")}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("card.title")}</CardTitle>
              <CardDescription>{t("card.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <P>{t("card.body")}</P>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                {t("card.action")}
                <ArrowRightIcon
                  data-icon="inline-end"
                  className="rtl:rotate-180"
                />
              </Button>
            </CardFooter>
          </Card>
          <ItemGroup className="gap-3">
            {cardItems.map((key) => (
              <Item key={key} variant="outline" role="listitem">
                <ItemContent>
                  <ItemTitle>{t(`card.items.${key}.title`)}</ItemTitle>
                  <ItemDescription>
                    {t(`card.items.${key}.description`)}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button variant="outline" size="sm">
                    {t("card.open")}
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </div>
      </Section>

      <Section id="feedback" title={t("sections.feedback")}>
        <Alert>
          <CircleCheckIcon />
          <AlertTitle>{t("feedback.alertTitle")}</AlertTitle>
          <AlertDescription>{t("feedback.alertDescription")}</AlertDescription>
        </Alert>
        <div className="flex flex-wrap items-center gap-6">
          <ToastButton
            label={t("feedback.toast")}
            message={t("feedback.toastMessage")}
          />
          <Spinner />
          <Avatar>
            <AvatarFallback>{t("feedback.avatarFallback")}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </Section>

      <Section id="empty" title={t("sections.empty")}>
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon />
            </EmptyMedia>
            <EmptyTitle>{t("empty.title")}</EmptyTitle>
            <EmptyDescription>{t("empty.description")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>{t("empty.action")}</Button>
          </EmptyContent>
        </Empty>
      </Section>

      <Section id="rich-text" title={t("sections.richText")}>
        {/* Plain elements, as rendered blog HTML will be in Phase 7. */}
        <article className="typeset typeset-article">
          <h3 dir="auto">{t("richText.heading")}</h3>
          <p dir="auto">{t("richText.paragraph")}</p>
          <p dir="auto" lang={otherLocale}>
            {t("richText.otherLanguage")}
          </p>
          <ul dir="auto">
            {richTextList.map((key) => (
              <li key={key}>{t(`richText.list.${key}`)}</li>
            ))}
          </ul>
          <blockquote dir="auto">
            <p>{t("richText.quote")}</p>
          </blockquote>
          <pre>
            <code>{t("richText.code")}</code>
          </pre>
          {/* Focusable so keyboard users can scroll a wide table. */}
          <div
            className="typeset-scroll"
            role="region"
            aria-label={t("richText.table.label")}
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  {tableColumns.map((column) => (
                    <th key={column}>{t(`richText.table.${column}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row}>
                    {tableColumns.map((column) => (
                      <td key={column}>
                        {t(`richText.table.rows.${row}.${column}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </Section>

      <Section id="formatting" title={t("sections.formatting")}>
        <Muted>{t("formatting.description")}</Muted>
        <div className="typeset">
          <table>
            <thead>
              <tr>
                <th>
                  <span className="sr-only">{t("sections.formatting")}</span>
                </th>
                <th>{t("formatting.server")}</th>
                <th>{t("formatting.client")}</th>
              </tr>
            </thead>
            <tbody>
              {formattingKinds.map((kind) => (
                <tr key={kind} data-format={kind}>
                  <th scope="row">{t(`formatting.${kind}`)}</th>
                  <td data-source="server">{serverFormatted[kind]}</td>
                  <td data-source="client">
                    <ClientFormatted kind={kind} />
                  </td>
                </tr>
              ))}
              <tr data-format="plural">
                <th scope="row">{t("formatting.plural")}</th>
                <td data-source="server" colSpan={2}>
                  {t("formatting.downloads", {
                    count: formattingSample.count,
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="overlays" title={t("sections.overlays")}>
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">{t("overlays.dialogTrigger")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("overlays.dialogTitle")}</DialogTitle>
                <DialogDescription>
                  {t("overlays.dialogDescription")}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">
                    {t("overlays.dialogCancel")}
                  </Button>
                </DialogClose>
                <Button variant="destructive">
                  {t("overlays.dialogConfirm")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <MenuIcon data-icon="inline-start" />
                {t("overlays.sheetTrigger")}
              </Button>
            </SheetTrigger>
            <SheetContent side={dir === "rtl" ? "left" : "right"}>
              <SheetHeader>
                <SheetTitle>{t("overlays.sheetTitle")}</SheetTitle>
                <SheetDescription>
                  {t("overlays.sheetDescription")}
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <LinkIcon />
                <span className="sr-only">{t("overlays.tooltipTrigger")}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("overlays.tooltip")}</TooltipContent>
          </Tooltip>
        </div>
        <Separator />
        <NavigationMenu>
          <NavigationMenuList>
            {navItems.map((key) => (
              <NavigationMenuItem key={key}>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/design">{t(`overlays.nav.${key}`)}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </Section>
    </main>
  )
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-6">
      <H2 id={id}>{title}</H2>
      {children}
    </section>
  )
}

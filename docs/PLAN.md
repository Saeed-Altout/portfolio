# Portfolio Build Plan — Next.js + Supabase

Oct 6, 2026 · @Saeed Altout

## Overview and golden rules

One Next.js app delivers three things: a bilingual public website (Arabic default, English), a blog with rich social previews, and an admin dashboard. Supabase holds the database and files. Claude Code builds every part through scripts and stops for your review before each commit.

Public pages: Home, About, Projects, Blog, Course, CV, Contact, sign-in and sign-up, and Account. Dashboard modules: Overview, Posts, Projects, Course, Media, Messages, Users, and Settings. Roles: `admin`, `user`, `guest`.

The rules below apply to every phase. Phase 0 copies them into `CLAUDE.md` so Claude Code reads them in every session.

1. **Scripts only.** Tables come from Prisma migrations, buckets from `scripts/`, the admin from the seeder. Nothing is created by clicking in the Supabase dashboard. Every script is safe to run twice.
2. **No commit without approval.** Each phase ends with the quality gate: format, lint, typecheck, unit tests, e2e tests, build. Then Claude Code stops, posts a review summary, and waits for the word "approved".
3. **shadcn first.** Use registry components. If one is missing, build it in `components/ui/` with the same pattern: `cva` variants, `cn()`, `data-slot`, and spread props.
4. **Theme is frozen.** Never change color tokens or radius in `globals.css`. Only the font variables change.
5. **Typography through components.** Headings, paragraphs, lists, and quotes use `components/ui/typography.tsx`, never ad-hoc text classes in pages.
6. **RTL-safe styles.** Use logical classes only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`). Physical `left`, `right`, `ml-`, and `mr-` are banned.
7. **No hardcoded text.** Every visible string lives in `messages/ar.json` and `messages/en.json`, with the same keys in both.
8. **Validate at every boundary.** One Zod schema per input, used by the form on the client and again by the server action.
9. **Authorize on the server.** Every server action, route handler, and dashboard page checks the session and role. The UI hiding a button is not security.
10. **Tests ship with the code.** A phase without its tests is not done.
11. **Current docs over memory.** Before using a library API, check the docs for the installed version.

## Stack and key decisions

Versions were checked on 6 October 2026. Claude Code pins exact versions at install time and reads each library's docs for the installed version, not from memory.

| Layer                | Choice                                                   | Note                                                                                    |
| -------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Framework            | Next.js App Router, fullstack                            | 16.3 with React 19.3. `proxy.ts` replaces `middleware.ts`.                              |
| UI kit               | shadcn CLI 4.21, preset `bIkf1RQ`, Radix base            | Preset = style vega, neutral colors, lucide icons, Geist font.                          |
| Styling              | Tailwind CSS v4                                          | Color and radius tokens are frozen.                                                     |
| Typography           | shadcn Typography components + shadcn/typeset            | Components for authored text, Typeset for rendered blog HTML.                           |
| Fonts                | Poppins (Latin) + Cairo (Arabic) via `next/font`         | Geist Mono stays for code.                                                              |
| i18n                 | next-intl                                                | `ar` default, `en` second.                                                              |
| Auth                 | Better Auth 1.7 + admin plugin + Prisma adapter          | Custom access control for `admin`, `user`, `guest`.                                     |
| ORM                  | Prisma 7 + `@prisma/adapter-pg`                          | Prisma 8 is still a release candidate. Do not use it.                                   |
| Database and files   | Supabase Postgres + Storage                              | New `sb_publishable_` and `sb_secret_` keys. Legacy keys are deprecated by end of 2026. |
| Validation           | Zod 4                                                    | One schema shared by client and server.                                                 |
| Forms                | react-hook-form + `@hookform/resolvers` + shadcn `Field` | The shadcn forms pattern.                                                               |
| Client state         | Zustand                                                  | UI state only.                                                                          |
| Client data fetching | TanStack Query (optional)                                | Dashboard only.                                                                         |
| Tables               | TanStack Table (shadcn Data Table)                       | Server-side paging, sorting, filters.                                                   |
| Rich text editor     | Plate (`platejs`) from the shadcn registry               | See decision 1.                                                                         |
| Social images        | Takumi `ImageResponse`                                   | Shapes Arabic correctly.                                                                |
| Email                | Resend behind an `EmailService` interface                | Console sender in dev and tests.                                                        |
| Toasts               | sonner                                                   | The shadcn toast pattern.                                                               |
| Tests                | Vitest + Testing Library, Playwright + axe               | Details in the testing section.                                                         |
| Package manager      | npm                                                      | The shadcn template creates `package-lock.json`.                                        |

### Decisions

1. **Editor: Plate.** It installs through the shadcn CLI (`@plate/...`) into `components/ui` and `components/editor`, which fits rule 3. Its static renderer (`PlateStatic`, `serializeHtml`) turns a post into server HTML with no editor code in the page, which is what SEO needs. Content is stored as JSON, so the server can validate it. Tiptap is the fallback if Plate feels too heavy, but its UI kit is not shadcn-based.
2. **Radix base.** Preset codes do not include the base library, so the init command adds `--base radix`. Radix has the widest compatibility with registry items such as Plate.
3. **Server Components read, Server Actions write.** Route handlers exist only for auth, file downloads, RSS, and image generation.
4. **Zustand holds UI state only:** editor panels, the media picker selection, the upload queue, table view preferences. It never caches server data. Stores used during server rendering follow the store-provider pattern, one store per request.
5. **TanStack Query only where the client drives the data:** the media picker's infinite scroll, the unread-messages badge, and live search. Public pages never load it.
6. **Supabase = Postgres + Storage only.** Supabase Auth and the Data API are not used. Prisma connects directly, so a script locks the Data API out of every table.
7. **Social images with Takumi, not `next/og`.** Satori, the engine behind `next/og`, breaks Arabic letter joining and direction. Takumi is a drop-in `ImageResponse` that shapes Arabic and mixed text.
8. **Latin slugs shared by both languages.** Arabic slugs become `%D8%...` strings when pasted into WhatsApp or LinkedIn.

Sources: [shadcn CLI and template](https://ui.shadcn.com/docs/cli), [shadcn RTL](https://ui.shadcn.com/docs/rtl), [shadcn Typeset](https://ui.shadcn.com/docs/typeset), [Better Auth admin plugin](https://better-auth.com/docs/plugins/admin), [next-intl with next/root-params](https://next-intl.dev/blog/nextjs-root-params), [Prisma release status](https://www.prisma.io/docs/orm/release-status), [Supabase API keys](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys), [Plate RSC rendering](https://next.platejs.org/docs/installation/rsc), [Takumi](https://github.com/kane50613/takumi).

## Build order

Ten phases in four stages: foundation first, then backend, dashboard, and website, with SEO and launch last.

<!-- The original build-order diagram did not survive the copy into this file; this list restates it. -->

1. **Foundation:** Phase 0 Bootstrap → Phase 1 Design system → Phase 2 Internationalization
2. **Backend:** Phase 3 Database and storage → Phase 4 Authentication → Phase 5 Backend core
3. **Dashboard and website:** Phase 6 Dashboard → Phase 7 Public website
4. **SEO and launch:** Phase 8 Blog SEO and social sharing → Phase 9 Hardening and launch

Each arrow is a stop: Claude Code commits a phase only after the gate passes and you reply "approved". The dashboard comes before the website because it creates the content the website shows, so the website is built on real seeded data instead of mocks.

## Project structure

The shadcn template puts code at the repo root (no `src/`), and the plan keeps that layout. Features are grouped by domain, and each feature owns its schemas, server logic, actions, and UI.

```text
.
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx             # <html lang dir>, fonts, providers
│   │   ├── not-found.tsx
│   │   ├── (site)/                # public header + footer
│   │   │   ├── page.tsx           # Home
│   │   │   ├── about/ projects/ projects/[slug]/
│   │   │   ├── blog/ blog/[slug]/ blog/tag/[tag]/
│   │   │   ├── course/ course/[slug]/
│   │   │   └── cv/ contact/ account/ privacy/
│   │   ├── (auth)/                # sign-in, sign-up, forgot and reset password, verify email
│   │   └── dashboard/             # admin shell + modules
│   ├── api/
│   │   ├── auth/[...all]/route.ts # Better Auth handler
│   │   └── files/[id]/route.ts    # gated download: check, count, redirect to signed URL
│   ├── sitemap.ts  robots.ts  manifest.ts
│   └── globals.css  typeset.css
├── components/
│   ├── ui/                        # shadcn components + custom ones in the same pattern
│   ├── editor/                    # Plate kits from the registry
│   └── layout/                    # site header, footer, dashboard sidebar, toggles
├── features/<name>/               # posts, projects, course, media, messages,
│   │                              # comments, users, settings, profile
│   ├── schemas.ts                 # Zod, shared by client and server
│   ├── service.ts                 # server-only Prisma access
│   ├── actions.ts                 # "use server": authorize, validate, call service, revalidate
│   ├── queries.ts                 # cached reads for Server Components
│   ├── components/                # feature UI built from components/ui
│   └── store.ts                   # Zustand, only when needed
├── server/                        # db.ts auth.ts permissions.ts session.ts storage.ts email/ seo/
├── lib/                           # utils.ts env.ts auth-client.ts share.ts
├── i18n/                          # routing.ts navigation.ts request.ts
├── messages/                      # ar.json en.json
├── prisma/                        # schema.prisma migrations/
├── generated/prisma/              # Prisma client output (git-ignored)
├── scripts/                       # write-local-env, db-harden, storage-setup, seed-admin, seed-demo, check-og
├── supabase/                      # config.toml for the local stack
├── tests/                         # integration/ e2e/ fixtures/ setup/
├── docs/                          # PLAN.md, decisions.md, reviews/
├── proxy.ts  prisma.config.ts  vitest.config.ts  playwright.config.ts
└── CLAUDE.md  AGENTS.md  .claude/settings.json
```

Unit and component tests sit next to the file they test as `*.test.ts(x)`. Integration and end-to-end tests live under `tests/`.

### Package scripts

| Script                    | Runs                                           | Purpose                                               |
| ------------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| `dev`                     | `next dev`                                     | Local server                                          |
| `build`                   | `prisma generate && next build`                | Production build                                      |
| `lint`                    | `eslint . --max-warnings 0`                    | Zero warnings allowed                                 |
| `format` / `format:check` | `prettier --write .` / `prettier --check .`    | All ts, tsx, css, json, md files                      |
| `typecheck`               | `tsc --noEmit`                                 | Strict types                                          |
| `test`                    | `vitest run`                                   | Unit, component, and integration tests                |
| `test:e2e`                | `playwright test`                              | Browser tests in both languages and themes            |
| `db:start` / `db:stop`    | `supabase start` / `supabase stop`             | Local Postgres and Storage (Docker)                   |
| `env:local`               | `tsx scripts/write-local-env.ts`               | Writes local Supabase URLs and keys into `.env.local` |
| `db:migrate`              | `prisma migrate dev`                           | New migration, dev only                               |
| `db:deploy`               | `prisma migrate deploy`                        | Apply migrations in CI and production                 |
| `db:harden`               | `tsx scripts/db-harden.ts`                     | RLS on every table, Data API roles revoked            |
| `storage:setup`           | `tsx scripts/storage-setup.ts`                 | Create or update buckets                              |
| `seed:admin`              | `tsx scripts/seed-admin.ts`                    | Admin account from env, safe to rerun                 |
| `seed:demo`               | `tsx scripts/seed-demo.ts`                     | Demo content in both languages, refused in production |
| `setup`                   | the seven steps from `db:start` to `seed:demo` | One command for a fresh machine                       |
| `og:check`                | `tsx scripts/check-og.ts <url>`                | Asserts the social meta tags of a page                |
| `gate`                    | format, lint, typecheck, test, test:e2e, build | Must pass before every review                         |

### Environment variables

`lib/env.ts` validates every variable with Zod at startup, so a missing value fails the build. `.env.example` is committed; `.env.local` is not.

| Variable                                                           | Used by         | Note                                                          |
| ------------------------------------------------------------------ | --------------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                             | client + server | Absolute base for canonical and social URLs                   |
| `DATABASE_URL`                                                     | server          | Pooled connection (Supabase transaction pooler in production) |
| `DIRECT_URL`                                                       | Prisma CLI      | Direct connection for migrations                              |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`                            | server          | Secret of 32+ random bytes                                    |
| `SUPABASE_URL`, `SUPABASE_SECRET_KEY`                              | server only     | `sb_secret_...` never reaches the browser                     |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client          | Only for uploads to signed URLs                               |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`                      | `seed:admin`    | Read by the seeder only                                       |
| `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_INBOX`                    | server          | Optional in dev; the console sender is used instead           |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`           | client + server | Optional spam protection for sign-up and contact              |

## Data model

Long text that exists in two languages lives in a translation table with one row per locale; short labels use paired `nameAr` and `nameEn` columns. A missing translation row means that item is not published in that language.

Better Auth generates the `User`, `Session`, `Account`, and `Verification` models with `npx auth@latest generate`. The admin plugin adds `role`, `banned`, `banReason`, and `banExpires` to `User`. The app adds only relations and one field, shown below.

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql" // URL lives in prisma.config.ts (Prisma 7)
}

enum Locale { ar en }
enum ContentStatus { DRAFT PUBLISHED ARCHIVED }
enum ProjectTrack { BIOMEDICAL HEALTH_SOFTWARE SOFTWARE }
enum ResourceKind { NOTES SLIDES FIGURE DATASET OTHER }
enum MessageStatus { NEW READ ARCHIVED SPAM }
enum CommentStatus { PENDING APPROVED REJECTED }
enum TimelineKind { EDUCATION WORK TRAINING CERTIFICATE }
enum SkillGroup { MEDICAL_DEVICES ELECTRONICS SOFTWARE TOOLS LANGUAGES }
enum BookmarkTarget { POST EPISODE PROJECT }

// Added to the Better Auth User model
model User {
  // ...generated fields...
  locale    Locale?            // language for emails (Better Auth additionalFields)
  posts     Post[]
  comments  Comment[]
  bookmarks Bookmark[]
  progress  EpisodeProgress[]
  uploads   Media[]
}

model Media {
  id           String   @id @default(cuid())
  bucket       String
  path         String
  mimeType     String
  sizeBytes    Int
  width        Int?
  height       Int?
  altAr        String?
  altEn        String?
  uploadedById String?
  uploadedBy   User?    @relation(fields: [uploadedById], references: [id], onDelete: SetNull)
  createdAt    DateTime @default(now())

  projectCovers    Project[]         @relation("ProjectCover")
  postCovers       Post[]            @relation("PostCover")
  postOgImages     Post[]            @relation("PostOgImage")
  episodeCovers    Episode[]         @relation("EpisodeCover")
  episodeResources EpisodeResource[]

  @@unique([bucket, path])
}

model Tag {
  id       String    @id @default(cuid())
  slug     String    @unique
  nameAr   String
  nameEn   String
  posts    Post[]
  projects Project[]
}

model Project {
  id           String        @id @default(cuid())
  slug         String        @unique
  track        ProjectTrack
  status       ContentStatus @default(DRAFT)
  featured     Boolean       @default(false)
  sortOrder    Int           @default(0)
  coverId      String?
  cover        Media?        @relation("ProjectCover", fields: [coverId], references: [id], onDelete: SetNull)
  repoUrl      String?
  liveUrl      String?
  startedAt    DateTime?
  endedAt      DateTime?
  publishedAt  DateTime?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  translations ProjectTranslation[]
  tags         Tag[]

  @@index([status, featured, sortOrder])
}

model ProjectTranslation {
  id             String  @id @default(cuid())
  projectId      String
  project        Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  locale         Locale
  title          String
  summary        String
  body           Json    // Plate editor value
  myRole         String?
  seoTitle       String?
  seoDescription String?

  @@unique([projectId, locale])
}

model Post {
  id           String        @id @default(cuid())
  slug         String        @unique
  status       ContentStatus @default(DRAFT)
  featured     Boolean       @default(false)
  coverId      String?
  cover        Media?        @relation("PostCover", fields: [coverId], references: [id], onDelete: SetNull)
  ogImageId    String?       // optional override of the generated social image
  ogImage      Media?        @relation("PostOgImage", fields: [ogImageId], references: [id], onDelete: SetNull)
  authorId     String
  author       User          @relation(fields: [authorId], references: [id])
  publishedAt  DateTime?
  viewCount    Int           @default(0)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  translations PostTranslation[]
  tags         Tag[]
  comments     Comment[]

  @@index([status, publishedAt])
}

model PostTranslation {
  id             String @id @default(cuid())
  postId         String
  post           Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  locale         Locale
  title          String
  excerpt        String
  content        Json   // Plate editor value
  contentText    String // plain text: search, reading time, fallback description
  readingMinutes Int
  seoTitle       String?
  seoDescription String?

  @@unique([postId, locale])
}

model Comment {
  id        String        @id @default(cuid())
  postId    String
  post      Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String
  user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  body      String
  status    CommentStatus @default(PENDING)
  createdAt DateTime      @default(now())

  @@index([postId, status, createdAt])
}

model Episode {
  id           String        @id @default(cuid())
  slug         String        @unique
  season       Int           @default(1)
  number       Int
  status       ContentStatus @default(DRAFT)
  youtubeId    String?
  durationMin  Int?
  coverId      String?
  cover        Media?        @relation("EpisodeCover", fields: [coverId], references: [id], onDelete: SetNull)
  publishedAt  DateTime?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  translations EpisodeTranslation[]
  resources    EpisodeResource[]
  progress     EpisodeProgress[]

  @@unique([season, number])
}

model EpisodeTranslation {
  id             String  @id @default(cuid())
  episodeId      String
  episode        Episode @relation(fields: [episodeId], references: [id], onDelete: Cascade)
  locale         Locale
  title          String
  deviceName     String
  summary        String
  body           Json
  seoTitle       String?
  seoDescription String?

  @@unique([episodeId, locale])
}

model EpisodeResource {
  id              String       @id @default(cuid())
  episodeId       String
  episode         Episode      @relation(fields: [episodeId], references: [id], onDelete: Cascade)
  kind            ResourceKind
  locale          Locale?      // null = language-neutral, e.g. a figure
  mediaId         String
  media           Media        @relation(fields: [mediaId], references: [id], onDelete: Restrict)
  requiresAccount Boolean      @default(false)
  downloads       Int          @default(0)
  sortOrder       Int          @default(0)
}

model EpisodeProgress {
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  episodeId   String
  episode     Episode  @relation(fields: [episodeId], references: [id], onDelete: Cascade)
  completedAt DateTime @default(now())

  @@id([userId, episodeId])
}

model Bookmark {
  id         String         @id @default(cuid())
  userId     String
  user       User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  targetType BookmarkTarget
  targetId   String
  createdAt  DateTime       @default(now())

  @@unique([userId, targetType, targetId])
}

model Message {
  id        String        @id @default(cuid())
  name      String
  email     String
  subject   String?
  body      String
  locale    Locale
  status    MessageStatus @default(NEW)
  ipHash    String?       // salted hash, never the raw IP
  createdAt DateTime      @default(now())

  @@index([status, createdAt])
}

model TimelineEntry {
  id           String       @id @default(cuid())
  kind         TimelineKind
  startDate    DateTime
  endDate      DateTime?
  sortOrder    Int          @default(0)
  translations TimelineTranslation[]
}

model TimelineTranslation {
  id          String        @id @default(cuid())
  entryId     String
  entry       TimelineEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)
  locale      Locale
  title       String
  org         String
  description String?

  @@unique([entryId, locale])
}

model Skill {
  id        String     @id @default(cuid())
  group     SkillGroup
  nameAr    String
  nameEn    String
  sortOrder Int        @default(0)
}

model Setting {
  key       String   @id // site, social, cv, seo, features
  value     Json     // validated by a Zod schema per key
  updatedAt DateTime @updatedAt
}
```

`Setting` keys: `site` (name and tagline per locale), `social` (LinkedIn, GitHub, YouTube, email), `cv` (one PDF media id per locale), `seo` (default description and image), `features` (comments on or off, sign-ups on or off).

## Roles and permissions

The role column accepts exactly `admin`, `user`, and `guest`. A visitor with no session is treated as `guest`; new accounts get `user` after email verification; only the seeder or another admin can create an `admin`. An admin can also set an account to `guest` to remove its abilities without banning it.

| Capability                                      | guest | user                   | admin                   |
| ----------------------------------------------- | ----- | ---------------------- | ----------------------- |
| Read published pages, posts, projects, episodes | Yes   | Yes                    | Yes                     |
| Share a post or copy its link                   | Yes   | Yes                    | Yes                     |
| Send a contact message (rate-limited)           | Yes   | Yes                    | Yes                     |
| Download open resources                         | Yes   | Yes                    | Yes                     |
| Download account-only resources                 | No    | Yes                    | Yes                     |
| Bookmark items, mark episodes complete          | No    | Yes                    | Yes                     |
| Comment on posts                                | No    | Yes, held for approval | Yes, published directly |
| Edit own profile, delete own account            | No    | Yes                    | Yes                     |
| Open the dashboard                              | No    | No                     | Yes                     |
| Create, edit, publish content; upload media     | No    | No                     | Yes                     |
| Moderate comments, read messages                | No    | No                     | Yes                     |
| Manage users, roles, bans                       | No    | No                     | Yes                     |
| Change site settings                            | No    | No                     | Yes                     |

The matrix becomes a Better Auth access-control statement in `server/permissions.ts`, passed to both the server `admin()` plugin and the client `adminClient()`:

```ts
import { createAccessControl } from "better-auth/plugins/access"
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access"

export const statement = {
  ...defaultStatements, // user + session actions from the admin plugin
  content: ["create", "update", "publish", "delete"],
  media: ["upload", "delete"],
  comment: ["create", "moderate"],
  message: ["read", "update"],
  resource: ["download-gated"],
  library: ["bookmark", "progress"],
  settings: ["update"],
} as const

export const ac = createAccessControl(statement)

export const guest = ac.newRole({})
export const user = ac.newRole({
  comment: ["create"],
  resource: ["download-gated"],
  library: ["bookmark", "progress"],
})
export const admin = ac.newRole({
  ...adminAc.statements,
  content: ["create", "update", "publish", "delete"],
  media: ["upload", "delete"],
  comment: ["create", "moderate"],
  message: ["read", "update"],
  resource: ["download-gated"],
  library: ["bookmark", "progress"],
  settings: ["update"],
})

// server/auth.ts: admin({ ac, roles: { admin, user, guest }, defaultRole: "user" })
```

Enforcement happens in four layers, and only the last one is cosmetic:

1. **`proxy.ts`** makes a fast cookie-only check and redirects signed-out visitors away from `/dashboard` and `/account`. It never touches the database.
2. **Pages and the dashboard layout** call `requireRole("admin")` with the full session. A layout check alone is not enough, because client navigation can skip it.
3. **Every server action and route handler** calls `requirePermission({ content: ["update"] })` before validating input. This is the real security boundary.
4. **The UI** uses `checkRolePermission` only to hide controls the user cannot use.

`server/session.ts` exposes `getSession()` (cached per request), `getRole()` (returns `guest` when there is no session), `requireRole()`, and `requirePermission()`. A table-driven test walks the matrix above for all three roles.

## Phase 0 — Bootstrap and Claude Code setup

Goal: a scaffolded repo where `npm run gate` passes and Claude Code knows the rules. Your manual steps are limited to installing Node.js 22 or newer, Git, and Docker Desktop (for the local Supabase stack).

1. **Scaffold.** Run your init command with two extra flags so it runs without prompts:

   ```bash
   npx shadcn@latest init --preset bIkf1RQ --template next --rtl --pointer --name portfolio --base radix
   ```

   `--name` sets the folder, and `--base` is required because preset codes do not include the base library. A test run on 6 October 2026 produced Next.js 16.3.6, React 19.3.0, `components.json` with `rtl: true`, a `next-themes` provider, Prettier with the Tailwind plugin, an `AGENTS.md`, and a Git repo with no commits.

2. **Plan files.** Save this plan as `docs/PLAN.md` and create `docs/decisions.md` for any deviation Claude Code makes.
3. **CLAUDE.md.** Keep the generated `@AGENTS.md` line (it points Claude Code to the Next.js docs bundled in `node_modules/next/dist/docs`) and add the rules below.
4. **Agent skill.** Run `npx skills add shadcn/ui` so Claude Code gets shadcn's own rules and CLI workflow.
5. **Permissions.** Create `.claude/settings.json` so commits and pushes always need your approval.
6. **Tooling.** Install `tsx`, `server-only`, `zod`, Vitest with Testing Library and jsdom, Playwright with `@axe-core/playwright`, Husky, and lint-staged. Add `noUncheckedIndexedAccess` to `tsconfig.json`, extend `format` to every file type, and add `generated/` and `supabase/.temp/` to `.prettierignore` and `.gitignore`.
7. **Environment.** Create `lib/env.ts` (Zod-validated, separate server and client parts) and `.env.example` with every variable from the table above.
8. **Gate.** Add the `gate` script, then one smoke test per runner: a Vitest test for `lib/env.ts` and a Playwright test that loads `/`.

```markdown
@AGENTS.md

# Portfolio: rules for Claude Code

The plan is docs/PLAN.md. Work one phase at a time, in order.

## Workflow per phase

1. Read the phase, then the docs of every library it touches (installed version).
2. Build the phase together with its tests.
3. Run `npm run gate` until it passes.
4. Write docs/reviews/phase-N.md using the review template, print it, and STOP.
5. Commit only after the user replies "approved". Never push unless asked.

## Hard rules

- Everything by script: migrations, buckets, seeds. Never ask the user to click in Supabase.
- shadcn first: `npx shadcn@latest search`, `docs`, `add`. A missing component goes in components/ui/ in the same pattern.
- Never edit color or radius tokens in app/globals.css. Only font variables change.
- Authored text uses components/ui/typography.tsx. Rendered rich text uses the `typeset` class.
- Logical classes only: ms, me, ps, pe, start, end, text-start. No ml, mr, pl, pr, left, right.
- Directional icons get `rtl:rotate-180`.
- No visible string outside messages/ar.json and messages/en.json, and both files keep identical keys.
- Forms: FieldGroup + Field, react-hook-form + zodResolver, and the same Zod schema on the server.
- Server files start with `import "server-only"`. Every action calls requirePermission() first.
- Zustand for UI state only. TanStack Query only inside the dashboard.
- Semantic colors only, gap-* instead of space-y-_, size-_ for squares, Spinner in loading buttons, Empty for empty states, sonner for toasts.

## Commands

npm run setup | dev | gate | test | test:e2e | db:migrate | db:deploy | storage:setup | seed:admin | seed:demo
```

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npx shadcn@latest *)",
      "Bash(npx prisma *)",
      "Bash(npx supabase *)",
      "Bash(npx auth@latest *)",
      "Bash(npx playwright *)",
      "Bash(git status *)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git add *)"
    ],
    "ask": [
      "Bash(git commit *)",
      "Bash(git push *)",
      "Bash(git tag *)",
      "Bash(git reset *)",
      "Bash(git rebase *)"
    ],
    "deny": [
      "Bash(git push --force *)",
      "Read(./.env.local)",
      "Read(./.env.production)"
    ]
  }
}
```

The Husky pre-commit hook runs lint-staged (Prettier and ESLint on staged files) for the commits you approve.

**Done when**

- [ ] `npm run gate` passes on the fresh scaffold.
- [ ] `CLAUDE.md` holds the rules and workflow; `.claude/settings.json` asks before every commit and push.
- [ ] A unit test proves `lib/env.ts` fails with a readable message when a variable is missing.
- [ ] `docs/reviews/phase-0.md` is written and nothing is committed.

## Phase 1 — Design system

Goal: the preset's look, unchanged, with Poppins and Cairo, both directions, both themes, and shadcn typography in place. Everything after this phase is built from these pieces.

1. **Fonts.** In the root layout, replace Geist with Poppins and Cairo and keep Geist Mono for code:

   ```ts
   const poppins = Poppins({
     subsets: ["latin"],
     weight: ["300", "400", "500", "600", "700"],
     variable: "--font-poppins",
     display: "swap",
   })
   const cairo = Cairo({
     subsets: ["arabic"],
     variable: "--font-cairo",
     display: "swap",
   })
   // <html className={cn("antialiased font-sans", poppins.variable, cairo.variable, fontMono.variable)}>
   ```

   In `app/globals.css`, change only the `--font-sans` line inside `@theme inline` to `var(--font-poppins), var(--font-cairo), ui-sans-serif, system-ui, sans-serif`. Poppins has no Arabic glyphs, so the browser takes Latin letters from Poppins and Arabic letters from Cairo on every page, with no per-locale switch. `--font-heading` keeps pointing at `--font-sans`.

2. **Direction.** Run `npx shadcn@latest add direction` and wrap the app in `DirectionProvider`. Because `components.json` has `rtl: true`, every later `shadcn add` writes logical classes automatically. Directional icons get `rtl:rotate-180`.
3. **Dark and light mode.** The template already ships `ThemeProvider` (class strategy, system default, "d" hotkey that ignores inputs and editors). Add `components/layout/mode-toggle.tsx` from the shadcn dark mode pattern: a dropdown with Light, Dark, and System.
4. **Typography.** Create `components/ui/typography.tsx` from the shadcn Typography page: `H1` to `H4`, `P`, `Lead`, `Large`, `Small`, `Muted`, `Blockquote`, `List`, `InlineCode`. Build them with `cva`, `cn`, `data-slot`, and Radix `Slot` for `asChild`. Convert the docs' physical classes to logical ones (`border-s-2 ps-6`, `ms-6`) and use `font-heading` for headings.
5. **Typeset.** You download `typeset.css` from the [Typeset builder](https://ui.shadcn.com/typeset) with fonts left on inherit; this is the one hand-copied file. Claude Code imports it after Tailwind and adds a `typeset-article` preset (start with 17px size, 1.85 leading, 1.4em flow; Arabic gets 2.0 leading through `:lang(ar)`).
6. **Base components.** Add only what the early phases use: card, badge, separator, skeleton, sonner, tooltip, dropdown-menu, sheet, dialog, alert, empty, spinner, field, input, textarea, label, item, avatar, navigation-menu.
7. **Design page.** Build a dev-only `/design` route (returns `notFound()` in production) showing typography, buttons, forms, cards, and empty states. Reviews use its screenshots in four modes: ar light, ar dark, en light, en dark.

**Guards added in this phase**

- **Theme freeze:** a test extracts every color and radius variable from `:root` and `.dark` and compares them to a snapshot. Changing any token fails the gate.
- **Logical classes only:** a test scans `app/`, `components/`, and `features/` for physical utilities (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `border-l`, `rounded-r`, and similar) and prints file and line. A trailing `// rtl-ok` comment allows a reviewed exception.
- **Fonts:** a Playwright test reads the computed `font-family` of body text and headings and expects Poppins and Cairo.
- **Accessibility:** an axe scan of `/design` in the four modes.

**Done when**

- [ ] Latin text renders in Poppins and Arabic text in Cairo, in both themes.
- [ ] Editing one color token makes `npm run gate` fail; reverting it makes it pass.
- [ ] The mode toggle switches light, dark, and system with no flash on reload.
- [ ] Axe reports no serious or critical issues on `/design`.
- [ ] `docs/reviews/phase-1.md` includes the four screenshots.

## Phase 2 — Internationalization

Goal: every route lives under `/ar` or `/en`, Arabic is the default, and direction, fonts, and formatting follow the locale.

1. **Routing** in `i18n/routing.ts`:

   ```ts
   export const routing = defineRouting({
     locales: ["ar", "en"],
     defaultLocale: "ar",
     localePrefix: "always", // /ar/... and /en/...: explicit share links, clean hreflang
     localeDetection: false, // "/" always opens Arabic, as requested
   })
   ```

2. **Request config.** `i18n/request.ts` reads the locale with `next/root-params` (new in Next.js 16.3) and validates it with `hasLocale()`, else `notFound()`. It also accepts an explicit `locale` argument, because root params do not work in Server Actions and Route Handlers yet; those pass the locale in with `bind`. Shared formats use time zone `Asia/Damascus` and `numberingSystem: "latn"`, so model numbers and metrics show Western digits in both languages.
3. **Navigation.** `i18n/navigation.ts` exports `Link`, `redirect`, `usePathname`, and `useRouter` from `createNavigation(routing)`. An ESLint `no-restricted-imports` rule bans `next/link` and the `next/navigation` equivalents in app code.
4. **Proxy.** `proxy.ts` runs the next-intl middleware with a matcher that skips `api`, `_next`, and files with an extension. Phase 4 adds the auth cookie check to the same file.
5. **Layouts.** `app/[locale]/layout.tsx` is the only root layout. Do not add a pass-through `app/layout.tsx`; non-localized 404s use `global-not-found`. The layout reads the locale with `getLocale()`, exports `generateStaticParams()` for both locales, and renders `<html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>` with `DirectionProvider`, `ThemeProvider`, `NextIntlClientProvider`, and the sonner `Toaster`. `setRequestLocale()` is no longer needed.
6. **Messages.** Namespaces per feature: `common`, `nav`, `home`, `about`, `projects`, `blog`, `course`, `cv`, `contact`, `auth`, `account`, `dashboard`, `validation`, `errors`, `seo`. Augment next-intl's `AppConfig` with the English file's type so a missing key is a compile error.
7. **Validation messages.** Zod schemas carry message keys (`"validation.email"`), never sentences. The form's error component translates the key, so client and server share one schema.
8. **Language switcher.** `components/layout/locale-switcher.tsx` swaps to the other locale on the same path with `router.replace(pathname, { locale })`. Phase 7 makes content pages fall back to their list page when the other translation does not exist.

**Tests**

- Unit: `ar.json` and `en.json` have identical keys and no empty values.
- End-to-end: `/` redirects to `/ar`; `/ar` has `lang="ar" dir="rtl"`; `/en` has `lang="en" dir="ltr"`; the switcher keeps the path; `/fr/anything` returns 404.

**Done when**

- [ ] Every page of the shell renders in both locales with the correct direction.
- [ ] No hardcoded visible strings remain, and the key-parity test passes.
- [ ] Dates and numbers format the same way on server and client (no hydration warnings).
- [ ] `docs/reviews/phase-2.md` is written.

## Phase 3 — Database and storage by script

Goal: `npm run setup` builds the whole local backend from nothing: Postgres, tables, locked-down permissions, and buckets. No step happens in the Supabase dashboard.

1. **Local stack.** Install the `supabase` CLI as a dev dependency, run `npx supabase init`, then `npm run db:start`. `npm run env:local` reads `supabase status -o env` and writes the local URLs, publishable key, and secret key into `.env.local`. If Docker is not available, a second free Supabase project serves as the dev database instead; the scripts do not change.
2. **Prisma 7.** Install `prisma@7` (dev), `@prisma/client@7`, `@prisma/adapter-pg`, `pg`, and `dotenv`. Pin the major version so `npx prisma` never picks up the Prisma 8 release candidate.

   ```ts
   // prisma.config.ts: the CLI uses the direct connection
   import { config } from "dotenv"
   import { defineConfig, env } from "prisma/config"
   config({ path: [".env.local", ".env"] })
   export default defineConfig({
     schema: "prisma/schema.prisma",
     migrations: { path: "prisma/migrations" },
     datasource: { url: env("DIRECT_URL") },
   })

   // server/db.ts: the app uses the pooled connection through the pg adapter
   import "server-only"
   import { PrismaPg } from "@prisma/adapter-pg"
   import { PrismaClient } from "@/generated/prisma/client"
   const globalForDb = globalThis as unknown as { db?: PrismaClient }
   export const db =
     globalForDb.db ??
     new PrismaClient({
       adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
     })
   if (process.env.NODE_ENV !== "production") globalForDb.db = db
   ```

3. **Auth tables first.** Install `better-auth`, write a minimal `server/auth.ts` (Prisma adapter, email and password, admin plugin), and run `npx auth@latest generate` to write the auth models into `prisma/schema.prisma`. Phase 4 completes the auth setup.
4. **Content schema.** Add the models from the Data model section, then `npm run db:migrate -- --name init`.
5. **Lock the Data API out.** Prisma connects as the table owner, which bypasses RLS, while Supabase's `anon` and `authenticated` roles must see nothing. `scripts/db-harden.ts` runs this SQL, and both `db:migrate` and `db:deploy` call it automatically:

   ```sql
   DO $$ DECLARE r record; BEGIN
     FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
       EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
     END LOOP;
   END $$;
   REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
   REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
   REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
   ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
   ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
   ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
   ```

6. **Buckets.** `scripts/storage-setup.ts` uses the secret key to create each bucket, or update it if it exists, so it is safe to rerun. Files are stored as `<entity>/<yyyy>/<mm>/<id>.<ext>`. No storage policies are added: browsers upload only to signed URLs the server creates, and private files are served only through signed download URLs.

| Bucket      | Public | Max size | Allowed types         | Holds                                       |
| ----------- | ------ | -------- | --------------------- | ------------------------------------------- |
| `media`     | Yes    | 5 MB     | JPEG, PNG, WebP, AVIF | Covers, post images, social image overrides |
| `avatars`   | Yes    | 1 MB     | JPEG, PNG, WebP       | User avatars                                |
| `documents` | No     | 50 MB    | PDF, DOCX, PPTX       | CV, thesis, course notes and slides         |

SVG is not allowed in public buckets because it can carry scripts.

7. **Test database.** `scripts/test-db.ts` creates a `portfolio_test` database in the same local Postgres if it is missing, applies migrations, and hardens it. Integration tests truncate every app table between files.
8. **Scripts and server code.** Vitest aliases `server-only` to an empty module. Scripts that import server modules run with `tsx --conditions=react-server` for the same reason.

**Tests**

- Every table in `public` has RLS enabled, and `anon` has no privilege on any of them.
- A request to the Supabase REST endpoint with the publishable key cannot read the `user` table.
- `storage:setup` runs twice without error; a signed upload works; a disallowed type and an oversized file are rejected; a `documents` file is unreachable without a signature.

**Done when**

- [ ] `npm run setup` (up to `storage:setup`) works on a clean machine with one command.
- [ ] The migration history has a single `init` migration that includes the auth tables.
- [ ] The hardening and storage tests pass.
- [ ] `docs/reviews/phase-3.md` is written.

## Phase 4 — Authentication, roles, and the admin seeder

Goal: email and password sign-up with verification, the three roles enforced on the server, and an admin created by script.

1. **Server config** in `server/auth.ts`:

   ```ts
   export const auth = betterAuth({
     database: prismaAdapter(db, { provider: "postgresql" }),
     emailAndPassword: {
       enabled: true,
       requireEmailVerification: true,
       minPasswordLength: 10,
       sendResetPassword: ({ user, url }) => email.passwordReset(user, url),
       // customSyntheticUser: include the admin plugin fields (Better Auth docs, "Email Enumeration Protection")
     },
     emailVerification: {
       sendOnSignUp: true,
       autoSignInAfterVerification: true,
       sendVerificationEmail: ({ user, url }) => email.verify(user, url),
     },
     user: {
       additionalFields: { locale: { type: "string", required: false } },
     },
     rateLimit: { enabled: true, storage: "database" },
     plugins: [
       admin({ ac, roles: { admin, user, guest }, defaultRole: "user" }),
       nextCookies(),
     ], // nextCookies stays last
   })
   ```

   If `npx auth@latest generate` changes the schema after this, add a migration named `auth`.

2. **Handler and client.** `app/api/auth/[...all]/route.ts` exports `toNextJsHandler(auth)`. `lib/auth-client.ts` creates the client with `adminClient({ ac, roles })`.
3. **Session helpers** in `server/session.ts`, as described in Roles and permissions. A signed-out visitor is redirected to sign-in with a `next` parameter. A signed-in user without the role gets `notFound()`, so the dashboard's existence is not revealed.
4. **Proxy.** Add the cookie-only check (`getSessionCookie` from `better-auth/cookies`) for `/<locale>/dashboard` and `/<locale>/account` before the next-intl middleware.
5. **Auth pages** in `app/[locale]/(auth)/`: sign-in, sign-up, forgot password, reset password, and verify email. Start from the `@shadcn` login and signup blocks, rebuilt with `FieldGroup` and `Field`. Better Auth error codes map to `errors.auth.<CODE>` message keys. The `next` parameter is accepted only as a same-site relative path, which prevents open redirects.
6. **Account page** (`/account`, role `user` or higher): name, avatar upload to the `avatars` bucket, preferred language, change password, active sessions with revoke, and delete account.
7. **Email.** `server/email/` defines an `EmailService` interface. The console sender (dev and tests) logs messages and keeps the last ones in memory for assertions; the Resend sender is used in production. Templates exist in Arabic (`dir="rtl"`) and English, picked from the user's `locale`.
8. **Admin seeder** `scripts/seed-admin.ts`, run with `tsx --conditions=react-server`:

   ```ts
   const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = adminEnvSchema.parse(
     process.env
   ) // password >= 12 chars
   const existing = await db.user.findUnique({ where: { email: ADMIN_EMAIL } })
   if (existing) {
     if (existing.role !== "admin" || !existing.emailVerified)
       await db.user.update({
         where: { id: existing.id },
         data: { role: "admin", emailVerified: true },
       })
   } else {
     await auth.api.createUser({
       body: {
         email: ADMIN_EMAIL,
         password: ADMIN_PASSWORD,
         name: ADMIN_NAME,
         role: "admin",
       },
     })
     await db.user.update({
       where: { email: ADMIN_EMAIL },
       data: { emailVerified: true },
     })
   }
   // logs "admin ready: <email>", never the password
   ```

   Running it twice leaves exactly one admin. If the installed Better Auth version requires an admin session for server-side `createUser`, use `auth.api.signUpEmail` and then set `role` and `emailVerified` with Prisma. Better Auth's `npx auth@latest create-admin` exists too, but the script is preferred because it reads env, is idempotent, and is tested.

**Tests**

- Integration: sign-up sends a verification email; sign-in fails before verification and succeeds after; password reset works; the new account's role is `user`.
- Integration: the seeder creates one admin, a second run changes nothing, and it promotes an existing account.
- Integration: the permission matrix, for every capability and all three roles, through the real server actions.
- End-to-end: a guest opening `/ar/dashboard` lands on sign-in; a `user` gets 404; the admin gets in; `?next=https://evil.example` falls back to the account page.

Better Auth's test-utils plugin, enabled only in the test environment, creates sessions for each role quickly.

**Done when**

- [ ] All auth pages work in both locales, both themes, and on mobile.
- [ ] `npm run seed:admin` creates the admin from `.env.local` and is safe to rerun.
- [ ] The permission matrix test passes for all three roles.
- [ ] `docs/reviews/phase-4.md` is written.

## Phase 5 — Backend core

Goal: every feature has a tested service layer and server actions, so the dashboard and the website only call functions that already work.

1. **One action pattern.** `server/action.ts` exports `defineAction({ permission, schema, handler })`. It checks the permission, parses the input with Zod, runs the handler, maps known errors to message keys (a Prisma unique violation becomes `errors.slugTaken`), and returns one result type:

   ```ts
   type ActionResult<T> =
     | { ok: true; data: T }
     | {
         ok: false
         error: MessageKey
         fieldErrors?: Record<string, MessageKey[]>
       }
   ```

2. **Services** (`features/*/service.ts`) are plain functions that take validated input and an actor id. They import no Next.js APIs, which keeps them easy to test. They own the business rules: unique slugs; publishing needs at least one complete translation; `publishedAt` is set on first publish; `contentText` and `readingMinutes` are computed on save.
3. **Editor content validation.** A Zod schema checks Plate JSON against an allowlist of node types: paragraphs, headings 2 to 4, lists, quotes, code blocks, images, tables, rules, callouts, links, and YouTube embeds. Links accept only `https:` and `mailto:`. The server rejects anything else, so stored content can always be rendered safely.
4. **Uploads go straight to Storage:**
   1. The browser calls `createUpload({ purpose, fileName, mimeType, size })`.
   2. The server checks the permission and the bucket rules, creates a pending `Media` row, and returns a signed upload URL.
   3. The browser uploads the file directly to that URL and reports image dimensions.
   4. The server confirms the object exists and its size matches, then marks the row ready.

   Files never pass through the Next.js server, which avoids the 1 MB default body limit of Server Actions. Images render through `next/image` with the Supabase storage host in `remotePatterns`. Private files are served by `/api/files/[id]`, which checks access, counts the download, and redirects to a signed URL valid for 60 seconds.

5. **Caching with Cache Components.** Enable `cacheComponents: true`. Public reads in `queries.ts` use `"use cache"`, `cacheTag()` (`posts`, `post:<slug>`, `projects`, `episodes`, `settings`), and `cacheLife("hours")`. Every mutation calls `updateTag()` for the tags it touches. Dashboard pages read the session, so they render dynamically inside `<Suspense>`. If a library conflicts with Cache Components, record it in `docs/decisions.md` before working around it.
6. **Client state.** Zustand stores use the store-provider pattern and selectors with `useShallow`. The first one is the upload queue (progress, retry, cancel). TanStack Query is mounted only in the dashboard layout, with query-key factories per feature; its reads go through small GET route handlers under `/api/dashboard/` that check permissions.
7. **Abuse protection for public writes.** Add a `RateLimit` model (`key`, `count`, `resetAt`) and `server/rate-limit.ts`. The contact form and comments get a fixed-window limit per hashed IP, a honeypot field, and Turnstile when its keys are set.
8. **Demo seed.** `scripts/seed-demo.ts` creates content through the services, so validation runs: three projects (one per track), three posts (Arabic only, English only, both), two episodes with resources (one account-only), timeline entries, skills, settings, a demo `user` and a demo `guest` account, messages, and comments in each status. It refuses to run when `NODE_ENV=production`.

**Tests**

- Unit: every Zod schema with valid and invalid cases; the editor validator rejects unknown nodes and `javascript:` links; reading time; slug rules (Latin only).
- Integration: every service against the test database, including the unique-slug error; every action for all three roles; the full upload flow against local Storage; the rate limiter.
- Coverage: at least 90% for `features/*/schemas.ts` and `features/*/service.ts`, 80% for `server/`.

**Done when**

- [ ] Every module the dashboard needs has a service, actions, and tests.
- [ ] `npm run setup` ends with demo content in both languages.
- [ ] Coverage thresholds are enforced by `npm run test`.
- [ ] `docs/reviews/phase-5.md` is written.

## Phase 6 — Dashboard

Goal: you can create, publish, and manage all content in both languages without touching code or the database.

**Shell.** Start from the `@shadcn` sidebar blocks (collapsible to icons) with breadcrumb, a command palette (`Command`, opened with Ctrl+K), mode toggle, locale switcher, and user menu. In Arabic the sidebar sits on the right; check how the installed Sidebar handles direction before passing `side` by hand. On mobile it becomes a `Sheet`.

**Shared building blocks** (in `components/ui` when generic, `components/dashboard` when dashboard-specific):

- `DataTable`: TanStack Table with shadcn `Table`, `Pagination`, a toolbar (search, filters, column visibility), and row actions. Page, sort, and filters live in the URL.
- `LocaleTabs`: edits the Arabic and English versions side by side and shows a completeness badge per language.
- `MediaPicker`: a dialog with a grid, drag-and-drop upload, and infinite scroll through TanStack Query.
- `SocialPreview`: shows how the post will look on LinkedIn, Facebook, WhatsApp, and Telegram while you edit the title, description, and image.
- `PageHeader`, `ConfirmDialog` (AlertDialog), `StatusBadge`, `StatCard`, and the `Empty` and `Skeleton` states.

| Module   | What it does                                                                                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview | Counts of published and draft posts, unread messages, pending comments, users, and downloads; recent messages; top posts by views                                                 |
| Posts    | List with status and language badges; editor page with Plate per language, slug, cover, social image override, tags, SEO fields, `SocialPreview`, debounced autosave, and publish |
| Projects | Same editor pattern plus track, role, dates, and repo and live links                                                                                                              |
| Course   | Episodes by season and number; YouTube ID with preview; resource manager (upload to `documents`, kind, language, account-only flag, order)                                        |
| Media    | Grid with filters, multi-upload, Arabic and English alt text, and "where used"; deleting a file in use is blocked                                                                 |
| Messages | Inbox tabs New, Read, Archived, Spam; detail sheet; reply by email                                                                                                                |
| Comments | Moderation queue: approve or reject, filter by post                                                                                                                               |
| Users    | Search and filter by role; set role (`admin`, `user`, `guest`); ban with reason; revoke sessions; the last admin cannot be demoted                                                |
| Profile  | About page content: timeline entries and skills                                                                                                                                   |
| Settings | Site name and tagline per language, social links, CV per language, default social image, comments and sign-ups on or off                                                          |

**Behavior rules**

- Every list has loading, empty, and error states.
- Destructive actions ask for confirmation; every action ends with a toast.
- Only toggles (featured, status) update optimistically, with rollback on error.
- Unsaved editor changes trigger a leave-page warning.
- Draft preview uses Next.js Draft Mode, enabled by an admin-only route handler.

**Tests**

- Component: `DataTable` URL sync, `LocaleTabs` completeness, `MediaPicker` selection, form errors in both languages, the upload queue store.
- End-to-end as admin: write a bilingual post with an image, publish it, and see it on the website; change the English title and see the website update; try to delete media in use; moderate a comment; demote a user to `guest` and confirm they can no longer comment; try to demote the last admin.
- Axe scans and screenshots of every module in the four modes.

**Done when**

- [ ] Every module works in Arabic and English, light and dark, desktop and mobile.
- [ ] The editor round-trip test (write, publish, view, edit, view) passes.
- [ ] `docs/reviews/phase-6.md` includes the screenshots.

## Phase 7 — Public website

Goal: a fast, clean site that reads well in Arabic and English, built from the same components as the dashboard and rendered from real seeded content.

**Layout.** The header holds your name, navigation (Home, Projects, Blog, Course, About, Contact), locale switcher, mode toggle, and an account menu; on mobile the navigation moves into a `Sheet`. The footer holds social links, the RSS link, privacy, and copyright.

| Page       | Route                      | Content                                                                                                                                                                                    |
| ---------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Home       | `/`                        | Positioning line and CTAs from Settings, 2 to 3 featured projects, latest posts, latest episode, contact strip                                                                             |
| About      | `/about`                   | Story, timeline, skills by group (including test equipment you have used)                                                                                                                  |
| Projects   | `/projects`                | Cards filtered by track with a `ToggleGroup`                                                                                                                                               |
| Case study | `/projects/[slug]`         | Cover, meta, body, gallery, downloads; the project editor offers a case-study template: problem, requirements and safety, block diagram, hardware, software, results, limitations, my role |
| Blog       | `/blog`, `/blog/tag/[tag]` | Posts with tag filter, search on `contentText`, pagination                                                                                                                                 |
| Post       | `/blog/[slug]`             | Title, date, reading time, cover, table of contents, body, share bar, related posts, approved comments, comment form for users, bookmark                                                   |
| Course     | `/course`                  | Season roadmap with published and upcoming episodes; progress for signed-in users                                                                                                          |
| Episode    | `/course/[slug]`           | Click-to-load YouTube player, summary, body, resources, mark complete, previous and next                                                                                                   |
| CV         | `/cv`                      | Web CV from timeline, skills, and settings; print stylesheet; PDF per language                                                                                                             |
| Contact    | `/contact`                 | Form with validation, rate limit, honeypot, optional Turnstile; direct links                                                                                                               |
| Account    | `/account`                 | Profile, bookmarks, course progress, own comments                                                                                                                                          |
| Privacy    | `/privacy`                 | What is stored, why, for how long, and how to ask for deletion                                                                                                                             |

**Rendering rules**

- Rich text renders on the server with `PlateStatic` inside `<article className="typeset typeset-article">`. Paragraph, heading, list, and quote elements get `dir="auto"`, so an English paragraph inside an Arabic post still reads left to right.
- Headings get stable ids for the table of contents; Arabic headings use numbered ids (`section-2`), never encoded Arabic.
- If a post has no translation in the current language, the page shows a short localized notice linking to the available version, is marked `noindex`, and is left out of hreflang.
- Public pages load no editor code and no TanStack Query. The YouTube player is a thumbnail until clicked.

**Visual quality bar.** The preset's look stays untouched; beauty comes from layout, spacing, and type. Use a 68-character reading width for prose, generous section spacing, real photos of your hardware, and block diagrams as SVG that use theme tokens, so they work in dark mode. Motion uses the installed `tw-animate-css`, stays subtle, and respects `prefers-reduced-motion`. Sections are composed from core components (`Card`, `Badge`, `Item`, `Separator`, typography); community registry blocks only with your approval.

**Performance budget** for Home and Post on a mid-range phone: LCP under 2.5 s, CLS under 0.1, INP under 200 ms.

**Tests**

- End-to-end: every page in the four modes renders with no console errors and a clean axe scan.
- RTL: navigation order is mirrored and directional icons are flipped in Arabic.
- Language fallback: the Arabic-only and English-only demo posts behave as specified.
- As a user: comment (held for approval), bookmark, mark an episode complete, download an account-only file (the counter goes up). As a guest, the same download asks for sign-in.
- Contact: success message, then the rate-limit message after repeated submits.
- The CV page hides the header and footer under print media emulation.

**Done when**

- [ ] All pages pass in the four modes on desktop and mobile viewports.
- [ ] The performance budget is met in a production build.
- [ ] `docs/reviews/phase-7.md` includes screenshots of Home, a case study, a post, and an episode.

## Phase 8 — Blog SEO and social sharing

Goal: a shared post shows the right title, description, and image on LinkedIn, Facebook, WhatsApp, and Telegram in both languages, and search engines get clean, linked language versions.

1. **Metadata builder** `server/seo/metadata.ts`, used by every page's `generateMetadata`:
   - `metadataBase` from `NEXT_PUBLIC_SITE_URL`; title template `%s | <site name>` from Settings.
   - Description from `seoDescription`, else the excerpt, trimmed to 160 characters at a word boundary.
   - `alternates.canonical` is the page's own locale URL. `alternates.languages` lists only the translations that exist, plus `x-default` pointing to Arabic.
   - `openGraph`: `type: "article"`, `url`, `siteName`, `locale` (`ar_AR` or `en_US`), `alternateLocale`, `title`, `description`, `images` (1200×630 with alt text), `publishedTime`, `modifiedTime`, `authors`, `tags`.
   - `twitter`: `card: "summary_large_image"`, same title, description, and image.
   - `robots`: `noindex` for drafts, previews, and missing-translation notices.
2. **Social image** in `app/[locale]/(site)/blog/[slug]/opengraph-image.tsx`, also exported as `twitter-image`. If the admin set an override image, the route returns that file. Otherwise Takumi's `ImageResponse` renders 1200×630: title (Arabic shaped correctly), site name, date, and cover thumbnail, with Cairo and Poppins font files stored in the repo. Output is PNG or JPEG under 300 KB, because WhatsApp drops large preview images. The route is cached with the post's tag, so an edit refreshes it. Home, projects, and episodes get their own versions.
3. **Structured data** in `server/seo/json-ld.ts`, typed with `schema-dts`: `Person` and `WebSite` on Home and About (with `sameAs` links to LinkedIn, GitHub, YouTube), `BlogPosting` on posts, `VideoObject` on episodes, and `BreadcrumbList` on detail pages. The script tag escapes `<` so content cannot break out of it.
4. **Indexing.** `app/sitemap.ts` lists every published URL in both locales with `alternates.languages` and `lastModified`. `app/robots.ts` disallows `/*/dashboard`, `/*/account`, and `/api`. Each locale has an RSS feed at `/<locale>/blog/rss.xml`, linked through `alternates.types`.
5. **Share bar** (`features/posts/components/share-bar.tsx`), built from `ButtonGroup`, `Button`, and `Tooltip`. All URLs come from `lib/share.ts`, a pure function with unit tests. The shared link is the canonical URL plus `utm_source=<platform>&utm_medium=social`. Lucide has no brand logos, so `components/ui/brand-icon.tsx` holds the needed paths from Simple Icons (CC0).

| Target                | URL pattern                                                   |
| --------------------- | ------------------------------------------------------------- |
| Native share (mobile) | `navigator.share({ title, url })`, shown first when available |
| LinkedIn              | `https://www.linkedin.com/sharing/share-offsite/?url={url}`   |
| Facebook              | `https://www.facebook.com/sharer/sharer.php?u={url}`          |
| WhatsApp              | `https://wa.me/?text={title}%20{url}`                         |
| Telegram              | `https://t.me/share/url?url={url}&text={title}`               |
| Copy link             | `navigator.clipboard.writeText(url)` and a toast              |

6. **Preview checker.** `scripts/check-og.ts <url>` fetches the page and asserts the canonical link, hreflang links, `og:title`, `og:description`, absolute `og:url`, `og:image` with 1200×630 dimensions, `og:type`, `og:locale`, and `twitter:card`. It then fetches the image and checks status 200, an image content type, and a size under 300 KB. It runs in the end-to-end suite and again after each deploy.
7. **After the first deploy (manual, once):** check one post per language in LinkedIn Post Inspector, Facebook Sharing Debugger, a WhatsApp chat, and Telegram's @WebpageBot. The first two also clear their caches after you edit a post.

**Tests**

- Unit: share URLs encode Arabic titles correctly; description trimming; JSON-LD builders escape `<`.
- End-to-end: `check-og` passes for the Arabic and English demo posts; the social image route returns a correctly sized image with an Arabic title; the sitemap lists both locales with alternates; `robots.txt` blocks the dashboard; the RSS feeds are well-formed XML; every share link has the right `href`, and copy shows a toast.

**Done when**

- [ ] `npm run og:check` passes on every demo post.
- [ ] Social images render Arabic titles correctly joined and right to left.
- [ ] `docs/reviews/phase-8.md` includes the generated images for one Arabic and one English post.

## Phase 9 — Hardening and launch

Goal: CI runs the gate on every change, production is created by the same scripts as local, and the live site passes the social preview checks.

1. **Security headers** from `next.config.ts`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` with camera, microphone, and geolocation off, `Strict-Transport-Security`, and `frame-ancestors 'none'`. The Content Security Policy starts in report-only mode, allowing the Supabase storage host, `youtube-nocookie.com` frames, and Turnstile, then switches to enforced once reports are clean.
2. **Dependencies.** `npm audit --omit=dev` must show no high or critical issues.
3. **CI** in `.github/workflows/ci.yml` on every pull request: install, start the local Supabase stack, run `env:local`, `db:deploy`, `storage:setup`, `seed:admin` with test values, and `seed:demo`. Then `format:check`, `lint`, `typecheck`, `test`, `test:e2e`, `build`, and Lighthouse CI on Home and one post with the Phase 7 budget.
4. **Production bootstrap.** You create the Supabase cloud project (an EU region such as Frankfurt is a reasonable default) and put its values in a git-ignored `.env.production.local`. Then `npm run prod:bootstrap` runs `db:deploy` (migrations and hardening), `storage:setup`, and `seed:admin`. `seed:demo` refuses to run there. Rerunning the bootstrap changes nothing.
5. **Hosting.** Vercel is the default, with the functions region next to the database. The app uses no Vercel-only features, so Railway, Render, Fly.io, or a VPS running `next start` also work. Migrations run in CI before deploy, never inside the build.
6. **Keep the database awake.** Supabase free projects pause after a week without activity. A scheduled GitHub Action calls `/api/health` (which runs `SELECT 1`) once a day; the Pro plan removes the issue.
7. **Backups.** A weekly scheduled GitHub Action runs `supabase db dump` into a private artifact.
8. **Go-live checks.** Set `NEXT_PUBLIC_SITE_URL` to the final domain before sharing any link, because social URLs are absolute. Verify the email domain (SPF and DKIM) in Resend. Run `npm run og:check` on production posts, do the manual checks from Phase 8, and submit the sitemap to Google Search Console and Bing Webmaster Tools.

**Done when**

- [ ] CI runs the full gate on every pull request and blocks merging on failure.
- [ ] `prod:bootstrap` builds tables, hardening, buckets, and the admin on the cloud project; a second run changes nothing.
- [ ] A test asserts the security headers on `/ar` and `/en`.
- [ ] `og:check` passes on production URLs and the sitemap is submitted.
- [ ] `docs/reviews/phase-9.md` is written.

## Testing strategy and the quality gate

Four test layers and one gate: nothing reaches review until `npm run gate` passes, and every phase adds tests for what it built. Tests never call the internet; email, Turnstile, and other outside services are replaced at their interface.

| Layer       | Tool                             | Runs against                                                     | Covers                                                                                                                 | Location                      |
| ----------- | -------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Unit        | Vitest (node)                    | Nothing external                                                 | Zod schemas, share URLs, slugs, reading time, editor validator, env, permission rules                                  | `*.test.ts` next to the code  |
| Component   | Vitest + Testing Library + jsdom | Rendered client components                                       | Forms and their errors in both languages, `DataTable`, `LocaleTabs`, `MediaPicker`, share bar, toggles, Zustand stores | `*.test.tsx` next to the code |
| Integration | Vitest (node), one worker        | Local Supabase: `portfolio_test` database and Storage            | Services, actions for all three roles, Better Auth flows, seeders, hardening, buckets, signed uploads, rate limiter    | `tests/integration/`          |
| End-to-end  | Playwright + axe                 | Production build (`next build` then `next start`) on seeded data | User journeys, accessibility, social meta tags, security headers                                                       | `tests/e2e/`                  |

Async Server Components are covered by Playwright, because Vitest and Testing Library cannot render them.

**Setup details**

- Vitest uses two projects, `unit` and `integration`. Integration runs one file at a time and truncates all app tables between files. Coverage uses the v8 provider with the thresholds from Phase 5.
- Playwright's global setup resets the test database and runs `seed:admin` and `seed:demo`, so every run starts from the same data. It signs in once per role and saves the session state to `tests/e2e/.auth/`.
- Playwright projects: `ar-light`, `ar-dark`, `en-light`, `en-dark` on desktop Chromium, plus `ar-mobile` on a phone viewport. Dark mode comes from the emulated `colorScheme`, which `next-themes` follows on first visit.
- Factories in `tests/fixtures/` build valid entities with overrides. Dates are fixed with fake timers.
- No `waitForTimeout`; only web-first assertions. Retries are allowed in CI only (2), with a trace on the first retry. A flaky test is fixed, or quarantined with a note in `docs/decisions.md`; it is never deleted to turn the gate green.

**Guards that enforce your rules**

| Rule                                 | Enforced by                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------- |
| Theme colors and radius never change | Theme snapshot test (Phase 1)                                               |
| RTL-safe classes only                | Physical-class scan with file and line output (Phase 1)                     |
| Poppins for Latin, Cairo for Arabic  | Computed font check in Playwright (Phase 1)                                 |
| No hardcoded text                    | Typed message keys and the `ar`/`en` key-parity test (Phase 2)              |
| Data API locked out                  | RLS and privilege test plus a REST probe with the publishable key (Phase 3) |
| Server-side authorization            | Permission matrix test through the real actions (Phases 4 and 5)            |
| Correct social previews              | `check-og` in the end-to-end suite and after deploy (Phase 8)               |
| Consistent formatting                | Prettier in the gate, lint-staged in the pre-commit hook                    |
| No commit without review             | `ask` rules in `.claude/settings.json`                                      |

**The gate**, in this order:

1. `format`: Prettier writes every file.
2. `lint`: ESLint with zero warnings.
3. `typecheck`: strict TypeScript.
4. `test`: unit, component, and integration tests with coverage thresholds.
5. `test:e2e`: Playwright across the five projects.
6. `build`: a production build.

When a step fails, Claude Code fixes the cause and reruns the whole gate from step 1. It never skips, disables, or loosens a test, lint rule, or threshold to get a pass. If a check itself looks wrong, it stops and asks you.

## Review checklist before every commit

After the gate passes, Claude Code writes `docs/reviews/phase-N.md` from the template below, prints it, and stops. You reply "approved" or list changes; nothing is committed before that.

```markdown
# Phase N review: <phase title>

## Summary

What was built and why, in 3 to 5 lines.

## Gate results

| Step      | Result                                                                |
| --------- | --------------------------------------------------------------------- |
| format    | <pass or fail>                                                        |
| lint      | <pass, 0 warnings>                                                    |
| typecheck | <pass>                                                                |
| test      | <count> passed; coverage: schemas <x>%, services <x>%, server <x>%    |
| test:e2e  | <count> passed across ar-light, ar-dark, en-light, en-dark, ar-mobile |
| build     | <pass>; largest public route JS: <size>                               |

## Changes

Grouped by feature, with file paths: added, changed, removed.

## Decisions and deviations

Anything that differs from docs/PLAN.md, also appended to docs/decisions.md.

## How to check it yourself

1. Commands to run (`npm run setup` only if the schema changed, then `npm run dev`).
2. URLs to open in both locales.
3. The seeded account to sign in with, per role.

## Screenshots

ar light, ar dark, en light, en dark (from Playwright).

## Risks and open questions

## Proposed commit message

feat(<scope>): <summary>
```

**Your checklist before replying "approved"**

Correctness and safety:

- [ ] The gate ran on the final code, after the last change.
- [ ] No test, lint rule, or coverage threshold was skipped, disabled, or loosened.
- [ ] No secrets, `.env` files, `generated/`, or test artifacts are in the diff.
- [ ] Every new server file imports `server-only`, and every new action calls `requirePermission()` first.
- [ ] Every new input has one Zod schema used by both the form and the server.
- [ ] New tables came from a migration, and the hardening test still passes.
- [ ] Scripts and seeders still run twice without errors.

UI and content:

- [ ] Only registry components, or new ones in `components/ui` that follow the shadcn pattern.
- [ ] No theme token changes, no raw colors, no physical direction classes.
- [ ] Every new string exists in both `ar.json` and `en.json`.
- [ ] Every new list has loading, empty, and error states.
- [ ] The four screenshots look right, including the mirrored layout and flipped icons in Arabic.

**After your reply**

- **"approved":** Claude Code commits with the proposed Conventional Commits message (`feat`, `fix`, `test`, `refactor`, `chore`), one commit per phase or per logical part. It never pushes, amends, or rewrites history unless you ask.
- **Change requests:** Claude Code applies them, reruns the full gate, adds a "Revision 2" section to the same review file, and stops again.

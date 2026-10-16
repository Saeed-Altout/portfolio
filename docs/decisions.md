# Decisions and deviations

Every place the build differs from docs/PLAN.md, newest phase last. Each entry says what changed, why, and what it affects.

## Phase 0 — Bootstrap (2026-10-15)

### Scaffold

- **The scaffold ran in a nested folder and was moved up.** `shadcn init --name portfolio` refuses an existing folder, even an empty one. It ran inside `D:\portfolio`, and the result was moved from `portfolio/portfolio` to the root.
- **The scaffold made its own commit.** shadcn CLI 4.21.2 created `4cc4e71 feat: initial commit` with the template files. The plan expected a repo with no commits. That commit was left as-is (no history rewrite), and all Phase 0 work sits on top of it, uncommitted.

### Versions

- **Next.js 16.3.6 → 16.3.8** (and `eslint-config-next` to match). 16.3.6 has six advisories fixed in 16.3.8, including a high-severity SSRF in Image Optimization and Draft Mode content leaking through `use cache`. The plan uses both Draft Mode and Cache Components. The fix stays on the 16.3 line the plan targets instead of moving to 16.4.
- **`shadcn` moved to devDependencies.** The template lists the CLI package as a runtime dependency only for `@import "shadcn/tailwind.css"`, which Tailwind compiles at build time. It pulls in `braces`, which has a high-severity advisory and no fixed release. With the move, `npm audit --omit=dev` (the Phase 9 check) reports 0 issues. The full `npm audit` still reports 9 high findings, all from that one `braces` advisory, reached through the shadcn CLI and `eslint-config-next` (`fast-glob`). Exploiting it needs attacker-controlled glob patterns, which these build tools never receive.
- **`@types/node` ^20 → 22.20.5.** Vitest 5 requires Node 22+ types, and the plan targets Node 22 or newer. `engines` in package.json now says `^22.13.0 || >=24.0.0`.
- **jsdom 29.1.1, not 30.** jsdom 30 requires Node ^24.15; this machine runs 24.13. 29.1.1 supports every Node 24.
- **Exact versions everywhere.** `.npmrc` sets `save-exact=true` and `engine-strict=true`. The template's `^` ranges were pinned to the installed versions.
- **npm 11 install scripts left unapproved.** npm 11.18 holds back install scripts of `esbuild` and `unrs-resolver` until approved. Everything works without them (`tsx` runs, ESLint resolves imports), so they stay unapproved, the safer default.

### Tooling

- **No `@vitejs/plugin-react` and no `vite-tsconfig-paths`.** Vitest 5 runs on Vite 8, which transforms TSX natively and resolves tsconfig paths with `resolve.tsconfigPaths: true`. The React plugin also failed to install because of a Babel 8 peer conflict.
- **Vitest projects are `unit` (node, `*.test.ts`) and `component` (jsdom, `*.test.tsx`).** The plan names `unit` and `integration`. Vitest 4 removed per-file environment matching, so component tests need their own project. `integration` is added in Phase 3 with the test database.
- **`server-only` alias added now** (plan: Phase 3), since the package is installed in Phase 0.
- **`typecheck` is `next typegen && tsc --noEmit`.** The bundled Next.js 16 docs recommend it: `next-env.d.ts` and route types are git-ignored and only exist after `next typegen`, `next dev`, or `next build`.
- **`build` is `next build` until Phase 3** adds `prisma generate`.
- **`.gitattributes` forces LF.** This machine has `core.autocrlf=true`, which checks files out with CRLF, and Prettier (`endOfLine: "lf"`) would then fail `format:check` on a fresh clone.
- **`.claude/skills/` is excluded from Prettier, ESLint, and TypeScript.** The vendored skill contains `.tsx` and `.mjs` examples, and reformatting it would break its lock hash.

### Environment

- **`lib/env.ts` exports `env` (server: every variable) and `clientEnv` (public only).** Both validate when the module loads, and `next.config.ts` imports it, so `dev`, `build`, `start`, and `typecheck` stop at startup with a list of every invalid variable. In the browser, reading `env` throws.
- **URLs use `z.url({ protocol: /^https?$/ })`, not `z.httpUrl()`.** `z.httpUrl()` rejects `localhost` and `127.0.0.1`, which local dev needs.
- **Empty values count as missing.** An unfilled line copied from `.env.example` fails like a missing one, and empty optional values become `undefined`.
- **`.env.local` exists on this machine with placeholder Supabase keys** (`sb_secret_placeholder_until_phase_3`, `sb_publishable_placeholder_until_phase_3`) and a generated `BETTER_AUTH_SECRET`. Phase 3's `env:local` replaces the Supabase values.

### Claude Code

- **The shadcn skill was installed from a local sparse clone.** `npx skills add shadcn/ui` timed out twice cloning the repository. A shallow, sparse clone of `skills/` was installed with `skills add <path> --skill shadcn --agent claude-code --copy`, and `skills-lock.json` was rewritten to name the GitHub source (`shadcn/ui`, `skills/shadcn/SKILL.md`) instead of a temporary local path. The content hash is unchanged. Restoring from the lock file (`npx skills experimental_install`) was not tested. The repo's second skill, `migrate-radix-to-base`, was not installed (this project uses Radix).
- **`.claude/settings.json` adds to the plan's rules without loosening any.** Every rule also has a `PowerShell(...)` twin, because this machine has a PowerShell tool and `Bash(...)` rules do not apply to it. Force pushes are denied in the `-f` and `--force*` forms too, and `.env.production.local` (Phase 9) is denied for reading.

### Tests

- **The five Playwright projects exist from Phase 0.** Until Phase 2 adds `/ar` and `/en`, `locale` only sets the browser language.
- **Each e2e run builds fresh** (`next build` then `next start` on port 3100, `reuseExistingServer: false`), so the gate never tests a stale server.
- **The smoke test also runs axe on `/`** (serious and critical issues fail), and a component test covers `Button`, so each Vitest project has at least one test.
- **The root layout got a placeholder `<title>` ("Portfolio").** The first gate run failed: axe reported `document-title` (serious) because the template page had no title. Phase 2 replaces the hardcoded title with translated metadata.

## Phase 1 — Design system (2026-10-15)

### Fonts

- **`--font-sans` names `"Poppins"` directly instead of `var(--font-poppins)`.** next/font adds a "Poppins Fallback" face (local Arial, every code point) to `--font-poppins`. It sits before Cairo in the stack and has Arabic glyphs, so Arabic text was drawn in Arial and Cairo never loaded. `adjustFontFallback: false` removes that face in a webpack build but is ignored by Turbopack, the Next.js 16 default (verified with clean builds of both). Naming the family skips the broken face. The e2e font test reads the fonts Chromium actually used (DevTools protocol), so a renamed family or a returning fallback fails the gate. Revisit when Turbopack honors `adjustFontFallback`.
- **Poppins loads 5 weights and every page preloads 7 font files.** The weights follow the plan. Trimming them is a Phase 7 performance question.

### Components

- **Accessibility fixes in three registry components, light mode only.** axe reported serious contrast failures in the preset: destructive Button and Badge text at 4.0:1, and AvatarFallback initials at 4.34:1 (minimum 4.5:1). The text color now mixes in the foreground token (`color-mix(in oklch, …)`: 20% for destructive, 10% for the avatar), the idiom the preset's secondary button already uses. Dark mode keeps the original classes. No token changed.
- **Typography deviates from the docs in three small ways.** `H1` drops the docs' `text-center` (a demo layout choice). Headings reset letter-spacing and the blockquote resets italics under `:lang(ar)`, because tracking breaks Arabic letter joins and Cairo has no italic. Each component also gets `data-slot="typography"` and `data-variant`.
- **`DirectionProvider` gets `dir`, not `direction`.** The generated component's types make Radix's `dir` required; `direction` from the docs fails to type-check. Both reach the same prop.
- **The mode toggle uses radio items,** so the menu shows the active choice. Its labels are English until Phase 2.
- **`sheet.tsx` has one reviewed `rtl-ok` line.** Its `side` prop names a physical edge (`left`, `right`), so `data-[side=left]:left-0` is intentional. Phase 7 picks the side from the direction.
- **`DirectionProvider`, `TooltipProvider`, and the sonner `Toaster` sit in the root layout now.** Phase 2 moves them into `app/[locale]/layout.tsx` with the real direction.

### Typeset

- **`app/typeset.css` was copied from the builder's source, not downloaded by hand.** The builder's "Get Code" button serves the file `apps/v4/app/(app)/(typeset)/typeset.css` unmodified (route `app/typeset.css/route.ts`). The copy comes from shadcn-ui/ui@4233ed1 with default fonts (body inherits, headings `--font-heading`, mono `--font-mono`). The `typeset-article` preset (17px, 1.85 leading, 1.4em flow, 2.0 leading under `:lang(ar)`) is appended in a separate block, so the upstream part stays diffable.
- **Wide tables need a focusable wrapper.** On a phone the `typeset-scroll` table scrolls sideways, and axe requires keyboard access, so the wrapper gets `role="region"`, an `aria-label`, and `tabIndex={0}`. The Phase 7 rich-text renderer must do the same.

### /design page

- **Language comes from `?lang=ar|en` until Phase 2** adds `/ar` and `/en`. `<main>` carries `lang` and `dir`, and a nested `DirectionProvider` sets Radix's direction. Overlays (dialog, sheet, tooltip) render in a portal under `<body>`, so in Arabic they still use the root `dir="ltr"` until Phase 2 sets `dir` on `<html>`.
- **Sample text lives in `app/design/content.ts`,** with the Arabic object typed as the English one. Phase 2 moves it into `messages/*.json`.
- **The page is gated by `DESIGN_PAGE`.** It is always on in development, and on in a production build only when `DESIGN_PAGE=on`, which the Playwright server sets. A unit test proves a production build returns 404 by default.

### Tests

- **The theme guard also snapshots the `@theme inline` color and radius mappings,** not only `:root` and `.dark`. Font variables are excluded.
- **The physical-class scan covers `.ts`, `.tsx`, and `.css`** in `app/`, `components/`, and `features/`. It flags margin, padding, and scroll-margin/padding sides, `left-`/`right-`, side borders and radii, `text-`/`float-`/`clear-` left/right, and `origin-` left/right.
- **The e2e suite saves review screenshots** to `test-results/screenshots/` on every run, and they are copied into `docs/reviews/phase-N/`.
- **`tests/fixtures/env.ts`** holds the valid test environment shared by the env and `/design` tests.
- **Known English strings for Phase 2:** the registry Dialog and Sheet close buttons (`sr-only` "Close") and the Spinner's default `aria-label="Loading"`.

## Phase 2 — Internationalization (2026-10-15)

### Routing and 404s

- **`dynamicParams = false` on `app/[locale]/layout.tsx`, overridden to `true` in `app/[locale]/[...rest]/page.tsx`.** `[locale]` matches any first segment, so `/unknown.txt` became locale "unknown.txt" and the root layout's `notFound()` returned a blank page. With `dynamicParams = false` only `ar` and `en` match, and every other first segment gets `app/global-not-found.tsx` (bilingual, `experimental.globalNotFound`). The catch-all turns it back on, so `/ar/anything` reaches the localized 404. **Phase 5:** Cache Components rejects `dynamicParams` at build time, so the export must go then. Invalid first segments will fall back to Next.js's blank 404 unless the proxy handles them; decide in Phase 5.
- **Known Next.js 16.3.8 issue: the localized 404 renders in the browser, not in the server HTML.** For `notFound()` under `[locale]`, the server sends an empty `<html id="__next_error__">` shell with the right status (404), title, and `noindex`. The browser then renders `app/[locale]/not-found.tsx` from the React payload, which the e2e test checks. Visitors without JavaScript see a blank page. It persists with a plain `<h1>` not-found page, without the proxy, without `getLocale`, without `globalNotFound`, and without `generateStaticParams`, so it is framework behavior. Recheck on each Next.js upgrade.
- **`/` redirects to `/ar` (307), and `/fr/anything` to `/ar/fr/anything`, which is a 404.** The next-intl proxy treats an unknown prefix as part of the path.

### Messages

- **Only the namespaces in use exist:** `common`, `seo`, `home`, `notFound`, `validation`, `design`. The plan's other namespaces are added with their features.
- **Only `common` and `validation` reach the browser.** `NextIntlClientProvider` gets that subset, and everything else renders on the server. A client component that needs another namespace must add it to `clientNamespaces` (also in CLAUDE.md).
- **The parity test also compares ICU argument names** between `ar.json` and `en.json`, so a translation cannot drop `{count}`.
- **The design page's sample text moved into `messages/*.json` (`design` namespace).** Arrays became named keys, so every key is type-checked.
- **The site name is "Portfolio" / "معرض الأعمال"** until Phase 8 reads it from Settings.

### Formatting

- **Shared named formats pin `numberingSystem: "latn"` and the time zone is `Asia/Damascus`.** next-intl has no default format that applies to unnamed calls or ICU `{n, number}`, so code uses named formats (`format.number(x, "decimal")`). Node 24 and Chromium (CLDR 47) already default `ar` to Western digits (`ar-SY` would give ١٬٢٣٤٫٥), and an e2e test fails if Arabic-Indic digits appear anywhere on the design page.
- **Server and browser formatting are compared in e2e** with the browser in America/Los_Angeles. The sample time (22:30 UTC) is already the next day in Damascus, so a browser ignoring the shared time zone would mismatch.

### Components and guards

- **The language switcher is a `Link`, not `router.replace`.** It works without JavaScript, carries `hreflang` and `lang`, and lets crawlers find the other version. It keeps the path and drops the query string.
- **Registry Dialog, Sheet, and Spinner read their labels from `common`** ("Close", "Loading"), including the optional Dialog footer close button.
- **Two ESLint rules enforce the plan:** `no-restricted-imports` bans `next/link` and next/navigation's `redirect`, `permanentRedirect`, `useRouter`, `usePathname`, and `react/jsx-no-literals` rejects JSX text in `app/` and `components/` (tests excluded). The second rule goes beyond the plan.
- **`TranslatedFieldError`** (`components/form/`) renders Zod and server errors whose message is a `ValidationKey`. Anything else shows `validation.invalid`, so raw English never reaches the page.
- **The Button test's `asChild` link is now `mailto:`.** With the catch-all route, `@next/next/no-html-link-for-pages` treats `<a href="/contact">` as an internal page.
- **Vitest inlines `next-intl`** (`test.server.deps.inline`). It imports `next/navigation` without an extension, which Node's ESM resolver rejects.

### Layout

- **Fonts live in `app/fonts.ts`,** shared by the root layout and `global-not-found.tsx`.
- **The Toaster follows the direction:** `dir`, `bottom-left` in Arabic, and a translated container label.
- **`/design` moved to `/[locale]/design` and is static now,** so `DESIGN_PAGE` is read at build time. The Playwright server sets it for both build and start.
- **`next/font/google` downloads fonts during `dev` and `build`.** On this machine `next dev` failed once while Google Fonts was unreachable. Phase 8 commits the font files for Takumi anyway; switching to `next/font/local` then removes the network dependency.

## Phase 3 — Database and storage by script (2026-10-16)

### Local stack

- **Docker Desktop runs on WSL 3.0.3, installed from Microsoft's MSI.** On this Windows Insider build, `wsl --install` failed with `Wsl/CallMsi/Install/REGDB_E_CLASSNOTREG` because of a sideloaded WSL 2.3.26 package. The official MSI from github.com/microsoft/WSL fixed it (checksum and Microsoft signature verified). This is machine setup, not a repo change.
- **Supabase services the app does not use are off** in `supabase/config.toml`: Realtime, Studio, the email catcher, Edge Functions, analytics, S3 protocol, vector buckets, and the CLI's seed step. What runs: Postgres, Storage, PostgREST, Kong, and Supabase Auth.
- **Supabase Auth runs only so `supabase status` reports the API keys.** With it off, the CLI prints no `PUBLISHABLE_KEY` or `SECRET_KEY`. The app never calls it (decision 6 stands); the alternative was scraping keys from container internals.

### Schema

- **`role` and `locale` on `User` are Postgres enums** (`Role`: admin, user, guest; `Locale`: ar, en). Better Auth generates them as strings; with enums the database itself rejects any other value. Phase 4's integration tests confirm Better Auth works with them.
- **Better Auth already creates a `RateLimit` model** (`rateLimit` table: key, count, lastRequest) for `rateLimit.storage: "database"`. Phase 5 must reuse it or give its own model another name; the plan's `RateLimit` (key, count, resetAt) would collide.
- **The schema-shaping Better Auth options live in `server/auth-options.ts`** (plugins, the `locale` field, database rate limiting), without `server-only`. The schema generator cannot load `server/auth.ts`, which starts with `import "server-only"`.
- **`npm run auth:schema` writes to `generated/auth-schema.prisma`, not `prisma/schema.prisma`.** A rerun would overwrite the enum and relation edits, so its output is for diffing after Better Auth upgrades. The CLI is pinned as a dev dependency (`auth@1.7.10`).
- **The init migration has 24 tables:** Better Auth's 5, the plan's 17 models, and the 2 implicit join tables for tags.

### Prisma 7

- **`prisma` is pinned to 7.10.1 because npm's `latest` tag now points at 8.0.0-rc.23.** CLAUDE.md warns against `prisma@latest`.
- **`prisma.config.ts` sets `datasource.url` to `DIRECT_URL`.** Prisma 7 removed `directUrl`, so the config URL is the CLI's only connection, and the app connects through the pg adapter with `DATABASE_URL`.
- **`db:migrate` runs `prisma generate` after `migrate dev`,** because Prisma 7 no longer does it automatically. `typecheck` and `build` also generate first, so a fresh clone typechecks.
- **npm's held-back install scripts are still unapproved** (prisma, @prisma/engines, @swc/core, @parcel/watcher, esbuild, unrs-resolver). Prisma 7 needs no Rust query engine and finds its schema engine without them.

### Scripts

- **Each script is a thin entry over `scripts/lib/`,** where tests import the same code. `db:migrate` and `db:deploy` share `scripts/db.ts`, which hardens after migrating.
- **Hardening also revokes `service_role`,** not only `anon` and `authenticated`. The app never uses the Data API, so even a leaked secret key cannot read app tables through it. The integration test checks all three roles.
- **`env:local` never prints a value.** It updates only the six Supabase variables in `.env.local`, creates the file from `.env.example` when missing, and generates `BETTER_AUTH_SECRET` when empty.
- **`setup` is `db:start`, `env:local`, `db:deploy`, `storage:setup`, `db:test`.** Phases 4 and 5 append `seed:admin` and `seed:demo`. Verified from wiped Docker volumes, then run a second time with no changes.
- **Commands run through one quoted command line.** `npx` is `npx.cmd` on Windows, which needs a shell, and an args array with `shell: true` triggers Node's DEP0190 warning.
- **Bucket sizes are binary megabytes** (5, 1, and 50 MiB), matching Supabase's own `50MiB` default.

### Tests

- **The hardening tests run against both databases.** Supabase's default grants to the API roles exist only in its `postgres` database; a fresh `portfolio_test` never had them, so a test there alone would pass trivially.
- **The Data API probe checks for PostgreSQL error `42501`** (permission denied), after a positive call to the API root, so it cannot pass because of a malformed request. It also probes with the secret key.
- **Storage tests write under `__integration__/<timestamp>/` and delete their files afterwards.** Storage is shared with the dev stack.
- **Integration tests run one file at a time.** A global setup prepares `portfolio_test`, and each file starts from empty tables.
- **The design page's guard test has a 30-second timeout.** Importing the whole page fresh took 6 seconds while the integration project ran alongside; the assertion is unchanged.

### Phase 2 follow-up

- **`/unknown.txt` logs `Error: Internal: NoFallbackError` on the server.** With `dynamicParams = false`, Next.js logs its internal no-fallback signal before serving the correct global 404. It appeared five times in the Phase 2 gate log too, and I missed it then. It is noise, not a failure, and it goes away when Phase 5 removes `dynamicParams`.

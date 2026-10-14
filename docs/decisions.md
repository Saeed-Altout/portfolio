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

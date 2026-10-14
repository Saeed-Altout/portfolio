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

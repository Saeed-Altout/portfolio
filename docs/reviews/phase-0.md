# Phase 0 review: Bootstrap and Claude Code setup

## Summary

The repo is scaffolded from preset `bIkf1RQ` (vega, neutral, lucide, Radix base, RTL on) with Next.js 16.3.8 and React 19.3. Tooling for every later phase is installed and pinned: Zod, tsx, Vitest with Testing Library and jsdom, Playwright with axe, Husky, and lint-staged. `lib/env.ts` validates every environment variable at startup, and `npm run gate` runs the six steps in the plan's order. `CLAUDE.md` holds the rules and workflow, `.claude/settings.json` asks before every commit and push, and the shadcn agent skill is installed for the project.

## Gate results

Second run, on the final code. The first run failed at `test:e2e` (see Decisions).

| Step      | Result                                                                                        |
| --------- | --------------------------------------------------------------------------------------------- |
| format    | pass                                                                                          |
| lint      | pass, 0 warnings                                                                              |
| typecheck | pass (`next typegen && tsc --noEmit`)                                                         |
| test      | 9 passed (unit 7, component 2); coverage thresholds start in Phase 5                          |
| test:e2e  | 10 passed across ar-light, ar-dark, en-light, en-dark, ar-mobile                              |
| build     | pass; `/` loads 6 scripts, 170.5 KB gzip (556.5 KB raw), almost all React and Next.js runtime |

`npm audit --omit=dev`: 0 vulnerabilities.

## Changes

**Dependencies and config**

- `package.json`: scripts `lint`, `format`, `format:check`, `typecheck`, `test`, `test:watch`, `test:e2e`, `gate`, `prepare`; exact versions; `engines` (Node `^22.13.0 || >=24.0.0`); lint-staged config. `next` and `eslint-config-next` 16.3.6 → 16.3.8; `shadcn` moved to devDependencies.
- `.npmrc` (new): `save-exact`, `engine-strict`.
- `.gitattributes` (new): LF line endings.
- `.gitignore`: keeps `.env.example` tracked; ignores `generated/`, `supabase/.temp/`, Playwright output.
- `.prettierignore`: adds `generated/`, `supabase/.temp/`, `package-lock.json`, test output, `.claude/skills/`.
- `tsconfig.json`: `noUncheckedIndexedAccess`; excludes `.claude/skills`.
- `eslint.config.mjs`: ignores generated output and the vendored skill.

**Environment**

- `lib/env.ts` (new): server and client schemas, `env` (server only) and `clientEnv`, one error that lists every invalid variable.
- `lib/env.test.ts` (new): 7 tests, including the readable message for a missing variable.
- `next.config.ts`: imports `lib/env.ts`, so `dev`, `build`, `start`, and `typecheck` fail at startup on a bad environment.
- `.env.example` (new): every variable from the plan, with local-stack defaults.

**Tests**

- `vitest.config.ts` (new): projects `unit` (node) and `component` (jsdom); `server-only` aliased to its empty module.
- `tests/setup/component.ts` (new), `components/ui/button.test.tsx` (new).
- `playwright.config.ts` (new): the five projects; a fresh production build on port 3100 for every run.
- `tests/e2e/smoke.spec.ts` (new): `/` returns 200 with no console errors, and axe finds no serious or critical issues.

**Claude Code**

- `CLAUDE.md`: the plan's rules and workflow, under the generated `@AGENTS.md` line.
- `.claude/settings.json` (new): the plan's permissions, mirrored for PowerShell.
- `.claude/skills/shadcn/` and `skills-lock.json` (new): the shadcn agent skill.
- `.husky/pre-commit` (new): runs lint-staged.

**Docs**

- `docs/PLAN.md`, `docs/decisions.md`, `docs/reviews/phase-0.md` (new).

**App**

- `app/layout.tsx`: placeholder `<title>` and Prettier formatting.
- Prettier formatting only: `app/globals.css` (indentation, one selector split; no token changed), `README.md`.
- Line endings only, so they drop out of the diff once staged: `app/page.tsx`, `components/theme-provider.tsx`, `AGENTS.md`, `.prettierrc`, `postcss.config.mjs`.

## Decisions and deviations

All are in `docs/decisions.md`. The ones that need your attention:

1. **The scaffold made its own commit.** shadcn CLI 4.21.2 created `4cc4e71 feat: initial commit`; the plan expected none. It is kept, and Phase 0 sits on top, uncommitted.
2. **Next.js 16.3.8 instead of 16.3.6.** 16.3.6 has six advisories, including a high-severity SSRF in Image Optimization and Draft Mode content leaking through `use cache`, which this plan uses. 16.3.8 is a patch release on the same line.
3. **The first gate run failed.** axe reported `document-title` (serious) because the template page had no `<title>`. The root layout now has a placeholder title, and the second run passed. The test was not changed.
4. **Vitest has a `component` project** next to `unit`, because Vitest 4 and later can no longer pick an environment per file. `integration` arrives in Phase 3.
5. **jsdom 29, not 30**, because jsdom 30 needs Node 24.15 or newer and this machine has 24.13.
6. **The shadcn skill was installed from a local sparse clone**, because `npx skills add shadcn/ui` timed out twice while cloning. Only the `shadcn` skill was installed; the repo's `migrate-radix-to-base` skill was skipped.

## How to check it yourself

1. On this machine, everything is installed and `.env.local` exists. On a fresh clone, run `npm install`, then `npx playwright install chromium`, then copy `.env.example` to `.env.local` and fill in `BETTER_AUTH_SECRET` and the two Supabase keys. Until Phase 3, any `sb_secret_...` and `sb_publishable_...` placeholder works.
2. `npm run gate` should end with the build's route table and no failures.
3. `npm run dev`, then open http://localhost:3000. It is still the template page; press `d` to toggle dark mode.
4. To see the startup check, run with a bad variable (Git Bash): `DATABASE_URL=mysql://x npm run typecheck`. It stops with `DATABASE_URL must be a postgresql:// URL`.
5. There are no locales or seeded accounts yet; they arrive in Phases 2 and 4.

## Screenshots

None in Phase 0, because `/` is still the template page. The four-mode screenshots start with the `/design` page in Phase 1.

## Risks and open questions

1. **Docker is not installed.** Phase 3 runs the local Supabase stack in Docker. Before Phase 3, either install Docker Desktop or tell me to use the plan's fallback: a second free Supabase project as the dev database.
2. **9 high findings remain in dev dependencies,** all from one `braces` advisory (stack exhaustion on deeply nested glob patterns) reached through the shadcn CLI and `eslint-config-next`. No fixed version exists. These tools only run at build time on our own patterns. Production dependencies are clean.
3. **Two install scripts are held back by npm 11** (`esbuild`, `unrs-resolver`). Everything works without them. Approving them is optional (`npm install-scripts approve <pkg>`).
4. **`.env.local` has placeholder Supabase keys** until Phase 3's `env:local` writes real ones. The app does not call Supabase yet.
5. **When you approve,** the Husky pre-commit hook runs Prettier and ESLint on the staged files as part of the commit.

## Proposed commit message

```text
chore(setup): bootstrap tooling, env validation, tests, and Claude Code rules

- Pin all dependencies; upgrade Next.js to 16.3.8 for security fixes
- Validate environment variables with Zod at startup (lib/env.ts)
- Add Vitest (unit, component) and Playwright (5 projects, axe) smoke tests
- Add the gate script, Husky pre-commit with lint-staged, LF line endings
- Add CLAUDE.md rules, .claude/settings.json permissions, shadcn agent skill
- Add docs/PLAN.md, docs/decisions.md, and the Phase 0 review

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
```

## Revision 2 (after approval)

Before committing, a check showed the pre-commit hook would block the commit. lint-staged passes every staged file to ESLint by name, including the vendored skill's `.mjs` and `.tsx` files, which ESLint ignores. ESLint 9 warns about an ignored file passed explicitly, and `--max-warnings 0` turns that warning into a failure. The lint-staged command now adds `--no-warn-ignored`. No rule changed: those files are excluded from `npm run lint` as well. The full gate was rerun after this change.

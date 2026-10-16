@AGENTS.md

# Portfolio: rules for Claude Code

The plan is docs/PLAN.md. Work one phase at a time, in order. Record every deviation from the plan in docs/decisions.md.

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
- No visible string outside messages/ar.json and messages/en.json, and both files keep identical keys. ESLint (`react/jsx-no-literals`) rejects JSX text.
- Client components only see the namespaces in `clientNamespaces` (app/[locale]/layout.tsx). Add a namespace there before a client component uses it.
- Links and redirects come from `@/i18n/navigation`; ESLint bans next/link and next/navigation's redirect, useRouter, usePathname.
- Forms: FieldGroup + Field, react-hook-form + zodResolver, and the same Zod schema on the server.
- Server files start with `import "server-only"`. Every action calls requirePermission() first.
- Zustand for UI state only. TanStack Query only inside the dashboard.
- Semantic colors only, gap-\* instead of space-y-\*, size-\* for squares, Spinner in loading buttons, Empty for empty states, sonner for toasts.
- Never skip, disable, or loosen a test, lint rule, or threshold to get a pass. If a check looks wrong, stop and ask.

## Commands

npm run setup | dev | gate | test | test:e2e | db:migrate | db:deploy | storage:setup | seed:admin | seed:demo

## Environment notes

- Windows machine: Git Bash and PowerShell are both available. Files use LF (.gitattributes).
- Environment variables are validated by lib/env.ts, imported from next.config.ts. `dev`, `build`, `start`, and `typecheck` need a valid .env.local (see .env.example).
- Pin exact versions (`.npmrc` has `save-exact=true`).
- `npm run test` includes integration tests against the local Supabase stack (Docker): run `npm run db:start` (or `npm run setup` on a fresh machine) first.
- Prisma is pinned to 7.x: never `npm i prisma@latest` (latest is the 8.0 release candidate).

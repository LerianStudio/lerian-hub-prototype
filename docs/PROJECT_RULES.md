# PROJECT_RULES.md — Lerian Hub

Project-specific rules for the Lerian Hub prototype. Complements the Ring engineering standards (fetched at cycle start); where this file is silent, Ring standards apply.

## Project shape

- **Lerian Hub** is a navigable **prototype** of the unified Lerian portal: a thin shared shell + SSO + independent apps.
- **Stack:** Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, `@lerianstudio/sindarian-ui` (shadcn/Radix tokens). `ui_library_mode = sindarian-ui`.
- All UX data (counts, health scores, tickets) is **illustrative** — not real.

## ⚠️ Next.js version caveat (from AGENTS.md)

This repo runs a build of Next.js whose APIs (middleware, route handlers, `cookies()`, `NextResponse`) **may differ from training data**. Before writing any middleware or route handler, **read the relevant guide under `node_modules/next/dist/docs/`**. Heed deprecation notices. This overrides assumed Next.js knowledge.

## Auth / session conventions (this cycle)

- **No tokens in `localStorage`.** Sessions are **httpOnly JWT cookies** (`hub_token`), mirroring operations-center's `oc_token` pattern. This is a hard rule (also a Ring frontend hard gate).
- JWT via **`jose`** (Edge-compatible — required because middleware runs on the Edge runtime).
- Session claim shape is the `HubSession` contract defined in `lib/auth/jwt.ts` — keep it stable across the codebase.
- `process.env` for auth is read **only** in `lib/auth/config.ts`.
- Provider composition order (Ring hard gate): SessionProvider (auth) outermost, then theme/feature providers.

## Testing

- **Test harness:** Vitest + @testing-library/react + jsdom (added in Epic 1.0).
- **TDD (RED→GREEN)** is required for: custom hooks, API integration, state management, conditional rendering, form validation.
- **Test-after** (no pre-test) for: pure layout/styling, animations, static presentational components.
- Coverage target: aim ≥ 80% on logic modules (`lib/auth/`, providers, route handlers). Prototype UI chrome is exempt from strict coverage.

## Code quality

- TypeScript strict; **no `any`** (use `unknown` + narrowing or generics).
- One UI concern per component file; keep files focused (Ring: implementation files ≤ 300 lines).
- Semantic HTML; no `<div onClick>`; no `dangerouslySetInnerHTML` without sanitization.
- Match the surrounding code's idiom, naming, and comment density.

## Commits

- Conventional commits (`feat|fix|test|chore(scope): …`). Commit messages and PR bodies in Portuguese are fine (repo convention), but code identifiers/paths stay English.
- Co-author trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

## Verification

- `npx tsc --noEmit` and `npm run build` must pass before a task is done.
- HTTP behavior verified with `curl` against `npm run dev`; UI flows verified in the browser.

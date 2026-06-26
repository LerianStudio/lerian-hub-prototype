# Dev Cycle Report — Hub SSO Unification, Phase 1

**Cycle:** ring:running-dev-cycle-frontend (lean Gate 0/7/8) · **Date:** 2026-06-26
**Plan:** `docs/plans/2026-06-26-hub-sso-unification.md`
**Outcome:** Phase 1 **Complete** (Gate 8 APPROVED). Phases 2–3 deferred by user decision (prototype-demo target met at Phase 1).

## What shipped

Replaced the Hub's `localStorage` auth mock with a real-shaped, operations-center-patterned **httpOnly cookie session** that demonstrates single sign-on, running locally in mock mode with zero setup.

| Area | Delivered |
|------|-----------|
| Session toolkit | `lib/auth/config.ts` (env, fail-closed google mode), `lib/auth/jwt.ts` (HS256 via `jose`, shape-guarded `verifySession`), `lib/auth/cookies.ts` (`hub_token`), `lib/auth/route-access.ts`, `lib/auth/mock-user{,-seed}.ts` |
| API | `app/api/auth/{login,me,logout}/route.ts` (mock mode mints session + returns identity; google mode → 501) |
| Route guard | `proxy.ts` (Next 16 renamed `middleware`→`proxy`); 307 → `/login?returnTo=`, clears stale cookie |
| Client | `AuthProvider` (fetch `/api/auth/me`, `signIn`/`signOut`, BroadcastChannel cross-tab logout), `RouteGuard` loading-gate, session-driven account menu, `returnTo` open-redirect sanitizer |
| Test harness | Vitest 4 + Testing Library + jsdom |

## Gate results

- **Gate 0** (7 tasks): all PASS, TDD RED→GREEN, ≥80% coverage on logic (mostly 95–100%).
- **Gate 7** (review): round 1 **ISSUES_FOUND** — 1 Critical (returnTo open-redirect via `/\`), 2 High (no `proxy` tests; tautological `secure` assertion), 3 Medium (unvalidated JWT payload cast; matcher/`isPublicPath` duplication; test gaps). Remediated → round 2 **PASS** (logic/security/tests/code). Reviewers: 7 dispatched (commons/tenancy N/A — Go-only); no conditional specialists triggered.
- **Gate 8** (acceptance): round 1 changes requested (2 user-reported bugs) → fixed → round 2 **APPROVED**.

## Post-acceptance bugs (caught by user, fixed)

1. **Account menu missing until hard refresh** — `signIn` never updated session state; mount-only fetch doesn't re-run on client nav. Fix: login route returns identity; `signIn` `setSession` before navigating.
2. **`CURRENT_USER` undefined on normal F5** — barrel re-export pulled the auth runtime (`jose`/`process.env`) into the client bundle (server/client boundary, **not** a circular import). Fix: zero-import `mock-user-seed.ts` leaf.

Both now covered by regression tests.

## Final state

- **9 commits** on `main`: `ce5cefe..197650f` (not pushed).
- **91/91 tests** pass · `tsc`/`lint`/`build` clean.
- **Open Low (non-blocking):** duplicate test-case label in `app/login/__tests__/page.test.tsx`.

## Notable Next.js 16 findings (per AGENTS.md caveat — bundled docs over training data)

- `cookies()` from `next/headers` is **async** (`await cookies()`).
- `middleware.ts` is deprecated/renamed to **`proxy.ts`** (function `proxy`, Node runtime).
- `useSearchParams()` requires a **`<Suspense>`** boundary for static prerender.

## Deviations from plan

- Added **Epic 1.0** (test harness) — the repo had no test deps.
- Review cadence consolidated **epic→phase** (one cumulative Gate 7) for this small, cohesive phase.
- Task 1.2.2 filename `middleware.ts` → `proxy.ts` (forced by Next 16).

## Deferred (planned, not built)

- **Phase 2** — real Google Workspace OIDC (authorize/PKCE/state/callback, `hd=lerian.studio`). Needs a Google Cloud OAuth app (client ID/secret), an authorized redirect URI. Carry forward: validate OAuth `state` (CSRF), and treat unknown `AUTH_MODE` as a hard error in production (don't default to mock).
- **Phase 3** — `.lerian.studio` parent-domain cookie + consumption contract for operations-center (its `AUTH_BACKEND` OAuth seam) and cs-platform (already does Google) to federate to the same IdP.

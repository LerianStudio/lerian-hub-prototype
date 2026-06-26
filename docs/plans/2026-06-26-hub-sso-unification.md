# Hub SSO Unification (Prototype) Implementation Plan

> **For implementers:** Use ring:executing-plans (rolling wave: dispatch each
> wave — a phase or one epic, your choice — as a workflow → review → user
> checkpoint → detail the next phase against the real code → repeat),
> or ring:running-dev-cycle for the full subagent-orchestrated workflow.
> This document is the living source of truth — task elaboration for later
> phases is written back into it during execution.

**Goal:** Replace the Hub's `localStorage` auth mock with a real-shaped, operations-center-patterned session layer that demonstrates Google-Workspace single sign-on — authenticate once at the Hub and carry a single httpOnly JWT cookie that gates every app — runnable locally out-of-the-box via a mock IdP mode and switchable to real Google OIDC via an env flag.

**Architecture:** Mirror operations-center's auth design. A root `middleware.ts` verifies a `hub_token` httpOnly JWT cookie (HS256, `jose`) on every protected route and 307-redirects to `/login` when it is missing or invalid. A set of `/api/auth/*` route handlers implement the session lifecycle: `login` (mock mode mints a demo identity; Google mode runs an OIDC authorize→callback with PKCE + state and `hd=lerian.studio` enforcement), `me` (returns the decoded session), and `logout` (clears the cookie). An `AUTH_MODE` env var toggles `mock` (default — no external calls, prototype runs as today) vs `google` (real OIDC), exactly like operations-center's `AUTH_BACKEND` seam. The client `AuthProvider` reads identity from the server session instead of `localStorage`. The cookie is scoped to `.lerian.studio` in production so sibling apps consume the same session.

**Tech Stack:** Next.js 16 (App Router), `jose` (Edge-compatible JWT — the library operations-center uses for Edge verification), Web Crypto API for PKCE, Next.js Route Handlers + Middleware. No database — identity is claims-based with a small seeded user map (demo).

> ⚠️ **Next.js version caveat (from `AGENTS.md`):** this repo runs a build of Next.js whose middleware/route-handler/cookies APIs may differ from training data. Before writing any middleware or route handler, read the relevant guide under `node_modules/next/dist/docs/`. Heed deprecation notices.

> **Scope boundary:** Target is a **prototype demo**. This plan changes only the Hub repo (`/home/dannesx/Lerian/hub`). It does **not** edit `operations-center` or `cs-platform-cli`; Phase 3 produces a *documented consumption contract* for those apps plus an in-Hub demonstration, not real-repo code.

## Phase Overview

| Phase | Milestone | Epics | Status |
|-------|-----------|-------|--------|
| 1 | One-click login mints a real httpOnly `hub_token` JWT session; middleware guards every route; `/api/auth/me` returns the identity; logout clears it — all in mock mode, running locally | 1.0, 1.1, 1.2, 1.3 | Complete |
| 2 | Real Google Workspace OIDC login (authorize redirect → callback with PKCE + state, `hd=lerian.studio` enforced), switchable via `AUTH_MODE=google`; mock stays the local default | 2.1, 2.2 | Epic-level |
| 3 | One session shared across apps via the `.lerian.studio` cookie; a documented contract + verification stub showing how operations-center and cs-platform consume the Hub session / federate to the same Google IdP | 3.1, 3.2 | Epic-level |

---

## Phase 1 — Session core (operations-center pattern, mock mode)

### Epic 1.0: Test harness

**Goal:** Vitest + Testing Library + jsdom are installed and a sample test runs, so every later epic can do real RED→GREEN TDD.
**Scope:** `package.json`, `vitest.config.ts` (new), test setup file
**Dependencies:** none
**Done when:** `npm run test` runs Vitest; a trivial sanity test passes; `npm run test -- --coverage` reports coverage; `npx tsc --noEmit` clean.
**Status:** Done

#### Task 1.0.1: Install and configure Vitest + Testing Library

- [x] Done — `ce5cefe` (vitest@4.1.9, TL react@16.3.2, jsdom; test/lint/tsc green)

**Context:** The Hub has zero test dependencies (`package.json` has only `dev/build/start/lint` scripts). The cycle requires TDD for hooks/API integration, so a harness must exist before any other task. The project is Next.js 16 + React 19 + TS strict + Tailwind v4.

**Implementation vision:** Add dev-deps: `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`. Create `vitest.config.ts` with the React plugin, `environment: "jsdom"`, globals enabled, a setup file importing `@testing-library/jest-dom`, and a path alias matching the project's `@/` import alias (check `tsconfig.json`). Add scripts: `"test": "vitest run"`, `"test:watch": "vitest"`. Add a trivial sanity test (e.g. renders a `<button>` and asserts it's in the document) to prove the harness works. Do NOT pull in Next.js-specific test runners; plain Vitest + jsdom is enough for unit/component tests, and route handlers/middleware are verified via curl per the plan.

**Files:**
- Modify: `package.json` (devDependencies + scripts)
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `lib/__tests__/sanity.test.ts` (or `.tsx`)

**Verification:** `npm install` then `npm run test` — the sanity test passes; `npx tsc --noEmit` clean.

**Done when:** Vitest runs green, coverage flag works, and TS still compiles.

---

### Epic 1.1: Session primitives — config, JWT, cookie

**Goal:** A typed, reusable session toolkit exists: env-driven config, HS256 JWT sign/verify, and `hub_token` cookie helpers, all modeled on operations-center's `jwt.ts` / `cookies.ts`.
**Scope:** `lib/auth/` (new), `.env.example`, `package.json` (add `jose`)
**Dependencies:** none
**Done when:** `npx tsc --noEmit` is clean; the modules export `signSession`, `verifySession`, `sessionCookieOptions`, and an `authConfig` object; a session minted by `signSession` round-trips through `verifySession` (exercised functionally in Epic 1.2).
**Status:** Done

#### Task 1.1.1: Add `jose` and the auth config module

- [x] Done — `7e16433` (lib/auth/config.ts, fail-closed google mode, 100% cov, 12 tests)

**Context:** The Hub has no auth backend, no `jose`, and no env handling (`app/layout.tsx` has only a theme bootstrap script; there is no `.env`). operations-center centralizes auth config and validates secret length (`src/lib/auth/jwt.ts:41-50`, min 32 chars). We mirror that.

**Implementation vision:** Add `jose` to `dependencies`. Create `lib/auth/config.ts` exporting a single `authConfig` object read from `process.env`:
- `mode`: `"mock" | "google"` from `AUTH_MODE`, defaulting to `"mock"`.
- `jwtSecret`: from `HUB_JWT_SECRET`; in `mock` mode fall back to a fixed dev constant so the prototype runs with zero setup; in `google` mode throw at startup if missing or `< 32` chars (mirror operations-center's fail-closed check).
- `cookieDomain`: from `HUB_COOKIE_DOMAIN` (e.g. `.lerian.studio`), `undefined` when unset so localhost works.
- `sessionTtlMinutes`: from `HUB_SESSION_TTL_MIN`, default `60` (operations-center's default), clamped to min 1.
- `google`: `{ clientId, clientSecret, redirectUri, hostedDomain: "lerian.studio" }` from `GOOGLE_*` env — only required/validated in Epic 2.1, leave the fields present but unvalidated here.

Document every variable in `.env.example` with comments. Do not read `process.env` anywhere outside this module.

**Files:**
- Create: `lib/auth/config.ts`
- Create: `.env.example`
- Modify: `package.json` (add `jose` to `dependencies`)

**Verification:** `npm install` then `npx tsc --noEmit` — clean. `node -e "process.env.AUTH_MODE='';import('jose').then(()=>console.log('jose ok'))"` prints `jose ok` (confirms the dep installed).

**Done when:** `authConfig` resolves with safe defaults in mock mode (no env set) and the module is the only place touching `process.env` for auth.

#### Task 1.1.2: JWT sign/verify and cookie helpers

- [x] Done — `e87e344` (lib/auth/jwt.ts + cookies.ts, 100% cov, 10 new tests; jose tests use node env)

**Context:** operations-center signs an HS256 JWT with a fixed claim shape (`src/lib/auth/jwt.ts:7-35`) and sets an httpOnly cookie `oc_token` with `sameSite:"lax"`, `secure` (except dev), `path:"/"`, `maxAge=TTL` (`src/lib/auth/cookies.ts:29-80`). cs-platform uses the same cookie discipline (`app_session_id`, httpOnly, HS256). We replicate this as the Hub's `hub_token`.

**Implementation vision:** Create `lib/auth/jwt.ts` using `jose` (`SignJWT` / `jwtVerify`, HS256) — `jose` is chosen over `jsonwebtoken` because it runs on the Edge middleware runtime, matching operations-center's `verify-edge.ts` choice. Define and export the session claim contract:

```ts
export interface HubSession {
  userId: string;
  email: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  locale: string;   // e.g. "pt-BR"
  iat: number;
  exp: number;
}
```

Export `signSession(claims): Promise<string>` (sets `iat`/`exp` from `authConfig.sessionTtlMinutes`) and `verifySession(token): Promise<HubSession | null>` (returns `null` on any failure — never throws). Create `lib/auth/cookies.ts` exporting `SESSION_COOKIE = "hub_token"`, `sessionCookieOptions()` returning `{ httpOnly:true, sameSite:"lax", secure: process.env.NODE_ENV!=="development", path:"/", domain: authConfig.cookieDomain, maxAge: authConfig.sessionTtlMinutes*60 }`, and a `clearCookieOptions()` (same attrs, `maxAge:0`). This claim shape is the cross-epic contract every later phase depends on — keep it stable.

**Files:**
- Create: `lib/auth/jwt.ts`
- Create: `lib/auth/cookies.ts`

**Verification:** `npx tsc --noEmit` clean. Round-trip is verified functionally via the API routes in Epic 1.2 (a token minted by `/api/auth/login` decodes through `/api/auth/me`).

**Done when:** `signSession`/`verifySession` round-trip a `HubSession`; `verifySession` returns `null` (not throw) for a tampered/expired/garbage token; cookie helpers emit operations-center-equivalent attributes.

---

### Epic 1.2: Auth API routes + route-guarding middleware

**Goal:** The session lifecycle works over HTTP: `POST /api/auth/login` mints the cookie (mock mode), `GET /api/auth/me` returns the session, `POST /api/auth/logout` clears it, and `middleware.ts` redirects unauthenticated page requests to `/login`.
**Scope:** `app/api/auth/` (new route handlers), `middleware.ts` (new), `lib/auth/`
**Dependencies:** Epic 1.1
**Done when:** curl flow against `npm run dev` shows: login returns `Set-Cookie: hub_token=...`; `/api/auth/me` with that cookie returns the seeded identity JSON; without the cookie a protected page returns a 307 to `/login`; logout returns a cookie with `Max-Age=0`.
**Status:** Done

#### Task 1.2.1: Mock-mode auth route handlers (`login`, `me`, `logout`)

- [x] Done — `b96f26f` (login/me/logout + lib/auth/mock-user.ts; 100% cov; curl-verified; note: Next 16 `cookies()` is async)

**Context:** The current login is a client button that writes `localStorage.sin_auth="1"` (`app/login/page.tsx:26-29`, `components/auth/auth-provider.tsx:67-74`). Identity is the hardcoded `CURRENT_USER` (`lib/apps.ts:171-183`). We move all of this server-side, modeled on operations-center's login route (`src/app/api/auth/login/route.ts`) which verifies, signs, and sets `oc_token`.

**Implementation vision:** Read the Next.js route-handler guide in `node_modules/next/dist/docs/` first — the cookies/Response API in this build may differ. Create three handlers:
- `app/api/auth/login/route.ts` — `POST`. In `mock` mode (`authConfig.mode==="mock"`) build a `HubSession` from a seeded demo user (reuse the `CURRENT_USER` data so the experience is unchanged; move that constant into `lib/auth/mock-user.ts` and have `lib/apps.ts` import it to avoid duplication), call `signSession`, set the `hub_token` cookie via `sessionCookieOptions()`, return 200 JSON `{ ok: true }`. In `google` mode, return 501 for now (Epic 2.1 fills it).
- `app/api/auth/me/route.ts` — `GET`. Read `hub_token`, `verifySession`; 200 with the `HubSession` (minus `iat`/`exp`) or 401 `{ error: "Unauthorized" }`.
- `app/api/auth/logout/route.ts` — `POST`. Set `hub_token` with `clearCookieOptions()`, return 200.

No Bearer-header path (browser-only demo); cookie is the sole transport.

**Files:**
- Create: `app/api/auth/login/route.ts`, `app/api/auth/me/route.ts`, `app/api/auth/logout/route.ts`
- Create: `lib/auth/mock-user.ts`
- Modify: `lib/apps.ts:171-183` (re-export the seeded user from `lib/auth/mock-user.ts`)

**Verification:** With `npm run dev`: `curl -i -X POST localhost:3000/api/auth/login` shows `Set-Cookie: hub_token=`; `curl -s --cookie "hub_token=<value>" localhost:3000/api/auth/me` returns the demo identity; `curl -i -X POST --cookie "hub_token=<value>" localhost:3000/api/auth/logout` shows `Max-Age=0`.

**Done when:** the three endpoints behave as above in mock mode and `google` mode returns 501.

#### Task 1.2.2: Route-guarding middleware

- [x] Done — `5fb79a9` (implemented as `proxy.ts` — Next 16 renamed middleware→proxy, Node runtime; helper 100% cov; curl-verified)

**Context:** The Hub has no `middleware.ts`; guarding is client-side via `RouteGuard` (`components/shell/app-shell.tsx:40`). operations-center gates server-side in `src/middleware.ts:444-470`: read token → verify → 307 redirect to `/login` (clearing the cookie) on failure for page routes. We adopt that as the authoritative guard.

**Implementation vision:** Read the Next.js middleware guide under `node_modules/next/dist/docs/` first (matcher config and `NextResponse` APIs may differ in this build). Create root `middleware.ts`: for each request, if the path is public (`/login`, `/api/auth/*`, Next internals `/_next/*`, static assets, favicon) → pass through. Otherwise read `hub_token`, `verifySession`; on success continue; on failure 307-redirect to `/login?returnTo=<original path>` and clear the cookie in the response. Keep verification in `lib/auth/jwt.ts` (Edge-safe via `jose`). Define a `config.matcher` excluding `_next` and static files so middleware does not run on assets.

**Files:**
- Create: `middleware.ts`
- Reference: `lib/auth/jwt.ts`, `lib/auth/cookies.ts`

**Verification:** With `npm run dev`: `curl -i localhost:3000/tickets` (no cookie) → `307` with `location: /login?returnTo=/tickets`. With a valid `hub_token` cookie → `200`. `curl -i localhost:3000/login` (no cookie) → `200` (public).

**Done when:** unauthenticated page requests redirect to `/login` carrying `returnTo`; authenticated requests pass; `/login` and `/api/auth/*` are always reachable.

---

### Epic 1.3: Client integration — drop localStorage, consume the server session

**Goal:** The UI authenticates through the new endpoints: the login button calls `/api/auth/login`, the shell shows the real session identity from `/api/auth/me`, and logout calls `/api/auth/logout` — `localStorage.sin_auth` is gone.
**Scope:** `components/auth/`, `app/login/page.tsx`, `components/shell/account-menu.tsx`, `app/(app)/layout.tsx`
**Dependencies:** Epic 1.2
**Done when:** clicking "Entrar" logs in and lands on `/` honoring `returnTo`; the account menu shows the session's name/email/initials (not a hardcoded const); "Sair" clears the cookie and returns to `/login`; no code references `sin_auth`.
**Status:** Done

> **Phase 1 closed (Gate 8 APPROVED).** Commits `ce5cefe..197650f` on `main`. Gate 7 PASS (after 1 remediation round); 2 post-acceptance bugs fixed (`197650f`): post-login session refresh + client/server bundle boundary for `CURRENT_USER`. 91/91 tests, build clean. Deviation log: Task 1.2.2 implemented as `proxy.ts` (Next 16 renamed `middleware`→`proxy`); review cadence consolidated epic→phase for this cohesive phase.

#### Task 1.3.1: Rewrite AuthProvider + RouteGuard against the session endpoint

- [x] Done — `9423db5` (provider fetches /api/auth/me; BroadcastChannel logout; sin_auth removed; 92%+ cov)

**Context:** `AuthProvider` is a `useSyncExternalStore` over `localStorage.sin_auth` (`components/auth/auth-provider.tsx:18,31-36,44-50,61-83`); `RouteGuard` (`components/shell/app-shell.tsx:40`) redirects client-side. With middleware now guarding routes, the client no longer enforces access — it only needs the identity for display and the logout action.

**Implementation vision:** Replace the `localStorage` store with a fetch of `GET /api/auth/me` on mount (state: `loading | authed(session) | anon`). Expose `session`, `loading`, `signIn(returnTo?)`, `signOut()` from the provider. `signIn` POSTs `/api/auth/login` then navigates to `returnTo ?? "/"`. `signOut` POSTs `/api/auth/logout` then navigates to `/login`. Keep cross-tab logout by listening to a `BroadcastChannel("hub_auth")` message posted on logout (replaces the old `storage` listener, since the cookie is httpOnly and invisible to JS). `RouteGuard` becomes a thin loading-gate: while `loading`, render nothing/spinner; it no longer redirects (middleware owns that) but may still short-circuit rendering until `me` resolves. Delete all `sin_auth` reads/writes.

**Files:**
- Modify: `components/auth/auth-provider.tsx`
- Modify: `components/shell/app-shell.tsx` (RouteGuard usage)
- Modify: `components/auth/route-guard.tsx` (if separate)

**Verification:** `npx tsc --noEmit` clean. `grep -rn "sin_auth" components app lib` returns nothing. In the browser: load `/tickets` while logged out → middleware bounces to `/login`; log in → land on `/tickets`.

**Done when:** identity comes from `/api/auth/me`, logout broadcasts across tabs, and `sin_auth` is fully removed.

#### Task 1.3.2: Wire login page and account menu to the session

- [x] Done — `f2d1147` (returnTo sanitize + Suspense; session-driven account menu; 68/68 tests; build green)

**Context:** Login button calls the old `signIn()` (`app/login/page.tsx:26-29`); account menu logout calls the old `signOut()` (`components/shell/account-menu.tsx:46-49`) and renders `CURRENT_USER`. Both must use the new provider API and real session data.

**Implementation vision:** Login page reads `returnTo` from the query string and calls `signIn(returnTo)`; show a pending state while the POST is in flight. Account menu renders `session.name / session.email / session.initials` from the provider (remove the direct `CURRENT_USER` import for display; the seeded const now only feeds mock-mode login server-side). "Sair de todos os apps" calls the provider `signOut()`. Keep all existing copy/styling.

**Files:**
- Modify: `app/login/page.tsx:26-29`
- Modify: `components/shell/account-menu.tsx:46-49`

**Verification:** With `npm run dev`: visiting `/sla` logged out redirects to `/login?returnTo=/sla`; logging in returns to `/sla`; the avatar menu shows the session identity; "Sair" returns to `/login` and a subsequent `/sla` visit redirects again. `npm run build` succeeds.

**Done when:** the full login→use→logout loop runs entirely on the cookie session with no `localStorage` auth and no hardcoded identity in the chrome.

---

## Phase 2 — Real Google Workspace OIDC

*(Epic-level only — elaborated by ring:executing-plans after Phase 1 lands, against the real `lib/auth` and route-handler shapes Phase 1 establishes.)*

### Epic 2.1: Google OIDC authorize + callback

**Goal:** `AUTH_MODE=google` runs a real OIDC login: `/api/auth/login` redirects to Google's authorize endpoint with PKCE + state; `/api/auth/google/callback` exchanges the code, verifies the ID token against Google's JWKS, enforces `hd=lerian.studio` and `email_verified`, then mints the same `hub_token` `HubSession` used in mock mode.
**Scope:** `app/api/auth/login/route.ts` (google branch), `app/api/auth/google/callback/route.ts` (new), `lib/auth/google/` (new), state/PKCE storage
**Dependencies:** Phase 1 (session toolkit + cookie + claim contract). Models: operations-center's `src/app/api/auth/oauth/callback/route.ts` (code exchange → claims → local JWT) and cs-platform's `hd` enforcement (`server/_core/authRoutes.ts:295,328`).
**Done when:** with real Google creds in env, a `@lerian.studio` Google account logs in end-to-end and lands authenticated; a non-`lerian.studio` account is rejected; `AUTH_MODE=mock` still works with zero setup.
**Status:** Pending

### Epic 2.2: State/PKCE handling + claim mapping

**Goal:** OIDC `state` (CSRF/replay) and PKCE `code_verifier` are generated, stored, single-use-consumed, and browser-bound; Google profile claims map cleanly onto the `HubSession` contract (name, email, initials, locale).
**Scope:** `lib/auth/google/`, a state store (signed httpOnly cookie is sufficient for the demo — no Valkey, unlike operations-center)
**Dependencies:** Epic 2.1
**Done when:** a replayed or mismatched `state` is rejected; PKCE round-trips; claim mapping produces a `HubSession` identical in shape to mock mode.
**Status:** Pending

---

## Phase 3 — Cross-app single session (demonstration + contract)

*(Epic-level only — elaborated after Phase 2. Target remains prototype demo: no edits to the real app repos; this phase produces a consumption contract and an in-Hub demonstration.)*

### Epic 3.1: Parent-domain cookie + silent-SSO demonstration

**Goal:** The `hub_token` cookie is scoped to `.lerian.studio` so any sibling app on a subdomain receives it automatically; demonstrate "log in once, every app is authenticated" within the Hub (the app routes already act as stand-in apps) and document the silent-SSO redirect behavior.
**Scope:** `lib/auth/cookies.ts` (domain), a short demo flow / page, docs
**Dependencies:** Phase 1 (cookie), ideally Phase 2 (real IdP) but works in mock mode too
**Done when:** with `HUB_COOKIE_DOMAIN=.lerian.studio`, the cookie is visible to subdomains; a documented walkthrough shows entering at the Hub and reaching an app without a second login.
**Status:** Pending

### Epic 3.2: Consumption contract for operations-center & cs-platform

**Goal:** A precise written contract (in `docs/`) for how the two real apps adopt the Hub session — the recommended path being **federate to the same Google Workspace IdP** (operations-center via its existing `AUTH_BACKEND` OAuth/Casdoor seam, `src/app/api/auth/oauth/callback`; cs-platform already does Google directly, `server/_core/authRoutes.ts:223-356`), so all three share Google's session for true SSO. Include the alternative shared-`hub_token` path (cookie on `.lerian.studio` + shared verification) with its trade-offs called out. Provide a verification stub/checklist, not real-repo edits.
**Scope:** `docs/` only
**Dependencies:** Phase 2
**Done when:** a reviewer can read the contract and know exactly what each app would change to consume the unified session, with the JWKS/claim/cookie/domain requirements spelled out.
**Status:** Pending

---

## Self-Review

| Check | Result |
|-------|--------|
| **Spec coverage** | "Authenticate once" → Epic 1.2/1.3 (single login mints one cookie). "Same login/session across apps" → Epic 3.1 (parent-domain cookie) + 3.2 (federation contract). "Google-style SSO / Google Workspace IdP" → Phase 2. "operations-center as the pattern" → cookie/JWT/middleware/callback conventions cited throughout (`oc_token`→`hub_token`, `JwtPayload`→`HubSession`, middleware redirect, OAuth-callback shape). "Hub as launcher + first auth" → Hub keeps its launcher; login is the entry, apps consume the session. "Prototype demo" → mock mode default, no real-repo edits. |
| **Vagueness scan** | Phase 1 tasks name exact files, endpoints, claim fields, and curl/grep verifications. No "appropriate"/"TBD" in the detailed wave. |
| **Contract consistency** | `HubSession` (Task 1.1.2) is the single claim contract; consumed by 1.2.1 (`me`), 1.3 (display), 2.1/2.2 (Google mapping), 3.x. `hub_token` cookie name and `sessionCookieOptions` defined once in `lib/auth/cookies.ts`. |
| **Phase boundaries** | Phase 1 ends with a fully working cookie-session login loop (mock). Phase 2 adds real Google without breaking mock. Phase 3 adds cross-domain + docs. Each phase ships working software. |
| **Verification plausibility** | Commands target real paths (`localhost:3000/api/auth/*`, `grep sin_auth`, `npx tsc --noEmit`, `npm run build`) with stated expected outcomes. No test framework is assumed (the Hub has none); verification is build + curl + browser. |

---

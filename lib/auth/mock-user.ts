/**
 * Mock-mode session builder — the auth-runtime half of the seeded demo user.
 *
 * The seed DATA itself lives in the leaf module `lib/auth/mock-user-seed.ts`
 * (zero imports). This module adds the auth-runtime concern on top: it
 * references `HubSessionClaims` from `lib/auth/jwt.ts` to project the seed onto
 * the session contract. Keeping the data in a leaf is what prevents the UI
 * consumers of `CURRENT_USER` (which re-export it via `lib/apps.ts`) from
 * dragging `jose`/`process.env` into the client bundle — the BUG 2 boundary
 * problem. See `mock-user-seed.ts` for the full rationale.
 *
 * `buildMockSession()` projects the seed onto the `HubSessionClaims` contract
 * (everything except the iat/exp timing claims, which `signSession` stamps).
 * The two derived claims the seed lacks — `userId` and `locale` — are stamped
 * here so the session shape stays stable across modes.
 *
 * `MOCK_USER` is re-exported for backwards compatibility with existing
 * importers (e.g. `lib/auth/__tests__/mock-user.test.ts`). The UI now imports
 * the seed directly from the leaf via `lib/apps.ts`.
 */
import type { HubSessionClaims } from "@/lib/auth/jwt";
import { MOCK_USER, MOCK_LOCALE } from "@/lib/auth/mock-user-seed";

export { MOCK_USER } from "@/lib/auth/mock-user-seed";

/**
 * Build the mock user's session identity claims. `userId` is derived from the
 * email so it is stable and deterministic without a real user store.
 */
export function buildMockSession(): HubSessionClaims {
  return {
    userId: `mock:${MOCK_USER.email}`,
    email: MOCK_USER.email,
    name: MOCK_USER.name,
    initials: MOCK_USER.initials,
    role: MOCK_USER.role,
    company: MOCK_USER.company,
    locale: MOCK_LOCALE,
  };
}

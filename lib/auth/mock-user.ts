/**
 * Seeded demo identity for `mock` auth mode — the single source of the
 * prototype's signed-in user. It lives here (not in lib/apps.ts) so both the
 * auth layer and the UI read the same seed; lib/apps.ts re-exports it as
 * `CURRENT_USER` for backwards compatibility with existing imports.
 *
 * `buildMockSession()` projects this seed onto the `HubSessionClaims` contract
 * (everything except the iat/exp timing claims, which `signSession` stamps).
 * The seed carries extra profile fields (firstName, phone, …) used to pre-fill
 * the account settings form; those are not part of the session token. The two
 * derived claims the seed lacks — `userId` and `locale` — are stamped here so
 * the session shape stays stable across modes.
 */
import type { HubSessionClaims } from "@/lib/auth/jwt";

/** Illustrative signed-in identity (single SSO account across all apps). */
export const MOCK_USER = {
  name: "Daniel Antunes",
  email: "daniel.antunes@lerian.studio",
  initials: "DA",
  /** Profile fields used to pre-fill the account settings form. */
  firstName: "Daniel",
  lastName: "Antunes",
  phone: "+55 11 98888-1234",
  role: "Engenheiro de Software",
  company: "Lerian",
  department: "Plataforma",
  timezone: "America/Sao_Paulo",
} as const;

/** Locale for the mock session — matches the seed's America/Sao_Paulo timezone. */
const MOCK_LOCALE = "pt-BR";

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

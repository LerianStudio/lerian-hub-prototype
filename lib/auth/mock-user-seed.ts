/**
 * The seeded demo identity — a LEAF data module with ZERO imports.
 *
 * This is the single source of the prototype's signed-in user. It deliberately
 * imports nothing (not even a type from the auth runtime) so it can be pulled
 * into the client bundle by the UI consumers of `CURRENT_USER`
 * (re-exported from `lib/apps.ts`) without dragging in `jose` or the
 * `process.env`-reading `lib/auth/config.ts`.
 *
 * Why a separate file: `lib/auth/mock-user.ts` also lives in the auth runtime
 * (it builds a `HubSessionClaims` session and so references `lib/auth/jwt.ts`).
 * Re-exporting the seed *through* that runtime module routed every client
 * consumer's bundle through the auth tree; under Turbopack's warm chunk-init
 * order the re-exported `const` could evaluate to `undefined`
 * ("CURRENT_USER is not defined" on a normal F5; a hard refresh masked it by
 * re-fetching all chunks). Both the UI (`lib/apps.ts`) and the session builder
 * (`lib/auth/mock-user.ts`) now import the seed from this leaf, so there is no
 * client → auth-runtime edge and the binding is always defined.
 */

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
export const MOCK_LOCALE = "pt-BR";

/**
 * POST /api/auth/login — mint a session.
 *
 * In `mock` mode: build a HubSession from the seeded demo user, sign it, set
 * the `hub_token` httpOnly cookie via `sessionCookieOptions()`, and return
 * `{ ok: true }`. In `google` mode this is not implemented yet (Epic 2.1) so
 * it returns 501 and sets no cookie.
 *
 * Mirrors operations-center's login route (verify -> sign -> set cookie); the
 * browser is the sole transport, so there is no Bearer-header path.
 *
 * Next.js (16.x): `cookies()` from `next/headers` is async and must be awaited
 * before `.set` — verified against node_modules/next/dist/docs route-handler
 * and cookies guides.
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/config";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/cookies";
import { signSession } from "@/lib/auth/jwt";
import { buildMockSession } from "@/lib/auth/mock-user";

export async function POST(): Promise<NextResponse> {
  if (authConfig.mode !== "mock") {
    // google mode is filled in Epic 2.1.
    return NextResponse.json(
      { error: "Not Implemented" },
      { status: 501 },
    );
  }

  const token = await signSession(buildMockSession());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());

  return NextResponse.json({ ok: true });
}

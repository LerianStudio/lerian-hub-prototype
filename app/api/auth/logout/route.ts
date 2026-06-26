/**
 * POST /api/auth/logout — end the session.
 *
 * Overwrites the `hub_token` cookie with `clearCookieOptions()` (same
 * attributes, maxAge 0) so the browser expires it immediately, then returns
 * 200. Setting maxAge 0 rather than deleting keeps the domain/path/secure
 * attributes aligned with how the cookie was set, which matters when a
 * cookie Domain is configured.
 *
 * Next.js (16.x): `cookies()` is async and must be awaited before `.set`.
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, clearCookieOptions } from "@/lib/auth/cookies";

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", clearCookieOptions());

  return NextResponse.json({ ok: true });
}

/**
 * Session JWT — HS256 sign/verify via jose, mirroring operations-center's
 * `oc_token` token shape (we mint `hub_token`). jose is used because
 * verification must work on the Edge runtime (middleware), where Node's
 * `crypto` is unavailable.
 *
 * `signSession` accepts the identity claims and stamps `iat`/`exp` itself from
 * `authConfig.sessionTtlMinutes`; callers never pass timing claims.
 * `verifySession` is fail-closed — ANY failure (bad signature, expired,
 * malformed) yields `null` rather than throwing.
 *
 * The `HubSession` interface is the cross-epic session contract: every later
 * phase (middleware, API routes, providers) reads it. Keep it stable.
 */
import { SignJWT, jwtVerify } from "jose";
import { authConfig } from "@/lib/auth/config";

/**
 * The verified session claim contract. Identity fields are set by the caller;
 * `iat`/`exp` are stamped by `signSession` and validated by jose on verify.
 */
export interface HubSession {
  userId: string;
  email: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  locale: string;
  iat: number;
  exp: number;
}

/** The identity claims a caller supplies — everything except the timing claims. */
export type HubSessionClaims = Omit<HubSession, "iat" | "exp">;

/** HS256 over the configured secret, encoded for jose. */
const secret = (): Uint8Array => new TextEncoder().encode(authConfig.jwtSecret);

/**
 * Sign a session JWT (HS256). `iat` is set to now and `exp` to now +
 * `authConfig.sessionTtlMinutes`; the caller only provides identity claims.
 */
export async function signSession(claims: HubSessionClaims): Promise<string> {
  const ttlSeconds = authConfig.sessionTtlMinutes * 60;
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secret());
}

/**
 * Verify a session JWT and return the decoded `HubSession`, or `null` on ANY
 * failure (bad signature, expired, malformed). Never throws — jose errors are
 * caught so callers can branch on null without try/catch.
 */
export async function verifySession(token: string): Promise<HubSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as HubSession;
  } catch {
    return null;
  }
}

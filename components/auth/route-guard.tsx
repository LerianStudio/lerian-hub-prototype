"use client";

import type { ReactNode } from "react";

import { useAuth } from "@/components/auth/auth-provider";

/**
 * Thin loading-gate for authed routes. `proxy.ts` (Next 16's renamed
 * middleware) enforces access server-side — unauthenticated page requests are
 * 307-redirected to `/login` before this ever renders — so the guard no longer
 * redirects. It only short-circuits rendering while GET /api/auth/me is still
 * resolving, to avoid flashing chrome before the identity is known.
 */
export function RouteGuard({ children }: { children: ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return null;
  }

  return <>{children}</>;
}

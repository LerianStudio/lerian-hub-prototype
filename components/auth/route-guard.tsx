"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/components/auth/auth-provider";

/**
 * Wraps authed routes. If the single Hub session is absent, it bounces to
 * `/login`. While auth is still resolving (`null`) or when signed out, it
 * renders nothing to avoid flashing protected content.
 */
export function RouteGuard({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authed === false) {
      router.replace("/login");
    }
  }, [authed, router]);

  if (authed !== true) {
    return null;
  }

  return <>{children}</>;
}

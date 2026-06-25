"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/**
 * Prototype-faithful client-side auth.
 *
 * The single Hub session is represented by `localStorage.sin_auth === "1"`.
 * In production this would be a real SSO cookie scoped to `.lerian.studio`.
 */
const STORAGE_KEY = "sin_auth";

interface AuthContextValue {
  /** `true` / `false` once resolved on the client, `null` while hydrating. */
  authed: boolean | null;
  /** Create the single Hub session. */
  signIn: () => void;
  /** Clear the session (sign out of all apps). */
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readAuth(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * External store backing the auth state. Subscribes to the `storage` event (so
 * other tabs stay in sync) and to a local listener set (so this tab's own
 * sign-in/out updates re-render). The server snapshot is `null` (unknown).
 */
function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  authListeners.add(callback);
  return () => {
    window.removeEventListener("storage", callback);
    authListeners.delete(callback);
  };
}

const authListeners = new Set<() => void>();
function emitAuthChange() {
  authListeners.forEach((listener) => listener());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // `null` server snapshot avoids hydration mismatch; the client snapshot reads
  // localStorage. The boolean is compared by value, so getSnapshot is stable.
  const authed = useSyncExternalStore<boolean | null>(
    subscribe,
    readAuth,
    () => null,
  );

  const signIn = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // localStorage may be unavailable (private mode).
    }
    emitAuthChange();
  }, []);

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    emitAuthChange();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ authed, signIn, signOut }),
    [authed, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}

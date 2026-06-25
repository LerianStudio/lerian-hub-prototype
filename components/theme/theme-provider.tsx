"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

/** localStorage key persisting the user's explicit theme choice. */
export const THEME_STORAGE_KEY = "sin_theme";

const MEDIA_QUERY = "(prefers-color-scheme: dark)";

interface ThemeContextValue {
  /** The user's chosen preference ('system' follows the OS). */
  theme: Theme;
  /** The actual theme being painted ('light' | 'dark'), after resolving 'system'. */
  resolvedTheme: ResolvedTheme;
  /** Set an explicit preference (persisted to localStorage). */
  setTheme: (theme: Theme) => void;
  /** Flip between explicit light/dark based on what is currently painted. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MEDIA_QUERY).matches;
}

/** Toggle the `dark` class on <html> to match sindarian-ui's `.dark` token set. */
function applyResolvedTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage unavailable (private mode, blocked) — fall through.
  }
  return "system";
}

/**
 * Client provider that owns theme state, persists explicit choices to
 * localStorage, applies the resolved theme via the `dark` class on <html>, and
 * reacts to OS preference changes while in `system` mode.
 *
 * The blocking inline script in `app/layout.tsx` sets the initial `dark` class
 * before paint, so the lazy initializer below always agrees with the DOM and no
 * flash occurs.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme());
  // Tracks OS preference; only relevant (and only updated) while in `system`.
  const [systemDark, setSystemDark] = useState<boolean>(() =>
    systemPrefersDark(),
  );

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (systemDark ? "dark" : "light") : theme;

  // Mirror the resolved theme onto <html> as a side effect (DOM only — no React
  // state writes here, so no cascading renders).
  useEffect(() => {
    applyResolvedTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Subscribe to OS preference changes; the listener feeds React state, which is
  // the allowed "external system → setState in a callback" pattern.
  useEffect(() => {
    const mql = window.matchMedia(MEDIA_QUERY);
    const onChange = (event: MediaQueryListEvent) =>
      setSystemDark(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Persisting is best-effort; ignore storage failures.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const currentResolved: ResolvedTheme =
        current === "system"
          ? systemPrefersDark()
            ? "dark"
            : "light"
          : current;
      const next: ResolvedTheme =
        currentResolved === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Access the current theme and controls. Must be used within `ThemeProvider`. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

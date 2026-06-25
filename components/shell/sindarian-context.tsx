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

interface SindarianContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const SindarianContext = createContext<SindarianContextValue | null>(null);

/**
 * Holds the Sindarian assistant drawer's open state and wires the global
 * ⌘K / Ctrl+K shortcut (Esc-to-close is handled by the Radix Sheet itself).
 */
export function SindarianStateProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo<SindarianContextValue>(
    () => ({ open, setOpen, toggle }),
    [open, toggle],
  );

  return (
    <SindarianContext.Provider value={value}>
      {children}
    </SindarianContext.Provider>
  );
}

export function useSindarian(): SindarianContextValue {
  const ctx = useContext(SindarianContext);
  if (!ctx) {
    throw new Error(
      "useSindarian must be used within a <SindarianStateProvider>",
    );
  }
  return ctx;
}

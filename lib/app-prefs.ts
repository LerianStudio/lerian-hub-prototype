"use client";

/**
 * Client-side app-launcher preferences — which apps appear on the home grid and
 * in what order — persisted to `localStorage` and shared across every component
 * via a single `useSyncExternalStore` store (the same SSR-safe idiom used by
 * `Greeting`).
 *
 * Design notes:
 * - The SERVER snapshot is always the deterministic registry default (every app
 *   visible, in registry order). The CLIENT snapshot reconciles the stored prefs
 *   against the live `APPS` registry on every read. This keeps SSR/first-paint
 *   stable (no hydration mismatch) while letting persisted choices apply after
 *   mount, exactly like the theme/greeting pattern.
 * - Reconciliation is intentionally robust: ids no longer in the registry are
 *   dropped, and apps present in the registry but missing from `order` are
 *   appended. A brand-new app therefore always shows up on the grid AND is
 *   toggle-able in the modal — stored state can never silently hide it.
 */

import { useSyncExternalStore } from "react";

import { APPS } from "@/lib/apps";

/** localStorage key persisting the launcher preferences (JSON). */
export const APP_PREFS_STORAGE_KEY = "hub_app_prefs";

export interface AppPrefs {
  /** App ids in display order. */
  order: string[];
  /** App ids hidden from the home grid. */
  hidden: string[];
}

/** Registry ids in their canonical order — the deterministic default. */
function registryIds(): string[] {
  return APPS.map((app) => app.id);
}

/** The default prefs: every registry app visible, in registry order. */
function defaultPrefs(): AppPrefs {
  return { order: registryIds(), hidden: [] };
}

/**
 * Reconcile arbitrary stored prefs against the live registry:
 * - keep only ids that still exist in the registry, preserving stored order;
 * - append any registry ids missing from `order` (newly-added apps), in
 *   registry order, so they appear on the grid;
 * - keep only `hidden` ids that still exist in the registry.
 */
function reconcile(prefs: Partial<AppPrefs> | null): AppPrefs {
  const ids = registryIds();
  const known = new Set(ids);

  const storedOrder = Array.isArray(prefs?.order) ? prefs.order : [];
  const seen = new Set<string>();
  const order: string[] = [];
  for (const id of storedOrder) {
    if (known.has(id) && !seen.has(id)) {
      order.push(id);
      seen.add(id);
    }
  }
  // Append registry apps not yet present (preserves registry order for the tail).
  for (const id of ids) {
    if (!seen.has(id)) {
      order.push(id);
      seen.add(id);
    }
  }

  const storedHidden = Array.isArray(prefs?.hidden) ? prefs.hidden : [];
  const hidden = storedHidden.filter(
    (id, index) => known.has(id) && storedHidden.indexOf(id) === index,
  );

  return { order, hidden };
}

// --- Store internals -------------------------------------------------------

const listeners = new Set<() => void>();

// Cached client snapshot. `useSyncExternalStore` requires `getSnapshot` to
// return a referentially-stable value when nothing changed, so we memoize and
// only mint a new object when the persisted state actually changes.
let cachedSnapshot: AppPrefs | null = null;

// Stable server snapshot (registry default). Memoized so repeated SSR reads are
// referentially equal.
let serverSnapshot: AppPrefs | null = null;

function readStored(): AppPrefs {
  if (typeof window === "undefined") return defaultPrefs();
  try {
    const raw = window.localStorage.getItem(APP_PREFS_STORAGE_KEY);
    if (!raw) return reconcile(null);
    const parsed = JSON.parse(raw) as Partial<AppPrefs>;
    return reconcile(parsed);
  } catch {
    // Corrupt JSON or storage unavailable (private mode, blocked) — fall back.
    return reconcile(null);
  }
}

function snapshotsEqual(a: AppPrefs, b: AppPrefs): boolean {
  if (a.order.length !== b.order.length) return false;
  if (a.hidden.length !== b.hidden.length) return false;
  for (let i = 0; i < a.order.length; i++) {
    if (a.order[i] !== b.order[i]) return false;
  }
  for (let i = 0; i < a.hidden.length; i++) {
    if (a.hidden[i] !== b.hidden[i]) return false;
  }
  return true;
}

function getSnapshot(): AppPrefs {
  const next = readStored();
  if (cachedSnapshot && snapshotsEqual(cachedSnapshot, next)) {
    return cachedSnapshot;
  }
  cachedSnapshot = next;
  return cachedSnapshot;
}

function getServerSnapshot(): AppPrefs {
  if (!serverSnapshot) serverSnapshot = defaultPrefs();
  return serverSnapshot;
}

function emit() {
  // Invalidate the cache so the next getSnapshot reflects the new write, then
  // notify subscribers (grid + modal stay in sync).
  cachedSnapshot = null;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Cross-tab sync: another tab writing the same key fires `storage` here.
  const onStorage = (event: StorageEvent) => {
    if (event.key === APP_PREFS_STORAGE_KEY) emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function persist(prefs: AppPrefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(APP_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Persisting is best-effort; ignore storage failures.
  }
  emit();
}

// --- Public hook + actions -------------------------------------------------

/**
 * SSR-safe read hook. Returns the registry default during SSR / first paint and
 * the reconciled persisted prefs on the client after mount.
 */
export function useAppPrefs(): AppPrefs {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Replace the full display order (ids reconciled against the registry). */
export function setOrder(ids: string[]): void {
  const current = readStored();
  persist(reconcile({ order: ids, hidden: current.hidden }));
}

/** Move `activeId` to where `overId` currently sits (dnd-kit drag-end). */
export function reorder(activeId: string, overId: string): void {
  if (activeId === overId) return;
  const current = readStored();
  const order = [...current.order];
  const from = order.indexOf(activeId);
  const to = order.indexOf(overId);
  if (from === -1 || to === -1) return;
  order.splice(from, 1);
  order.splice(to, 0, activeId);
  persist({ order, hidden: current.hidden });
}

/** Hide an app from the home grid (still toggle-able in the modal). */
export function hideApp(id: string): void {
  const current = readStored();
  if (current.hidden.includes(id)) return;
  persist({ order: current.order, hidden: [...current.hidden, id] });
}

/** Show a previously-hidden app on the home grid. */
export function showApp(id: string): void {
  const current = readStored();
  if (!current.hidden.includes(id)) return;
  persist({
    order: current.order,
    hidden: current.hidden.filter((hiddenId) => hiddenId !== id),
  });
}

/** Toggle an app's visibility on the home grid. */
export function toggleApp(id: string): void {
  const current = readStored();
  if (current.hidden.includes(id)) showApp(id);
  else hideApp(id);
}

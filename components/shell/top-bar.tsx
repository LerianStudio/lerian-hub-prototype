"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AccountMenu } from "@/components/shell/account-menu";
import { LerianLogo } from "@/components/shell/lerian-logo";
import { useSindarian } from "@/components/shell/sindarian-context";

/**
 * Tracks whether the header should be hidden based on scroll direction.
 *
 * Scrolling *down* past a small threshold hides it; any scroll *up* (or being
 * near the top) reveals it again. The returned flag only drives a transform
 * that's scoped to mobile in the markup — on `sm+` the bar stays put.
 */
function useHideOnScrollDown() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY.current;

      // Ignore jitter; always reveal near the top of the page.
      if (Math.abs(delta) > 6) {
        if (y < 64 || delta < 0) setHidden(false);
        else if (delta > 0) setHidden(true);
        lastY.current = y;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

/**
 * HG3 — the slim, persistent-search header (Google "search at the top" idiom).
 *
 * Responsive layout:
 *
 * - **Mobile (< sm / < 640px):** two rows. The top row holds a trimmed brand
 *   (compact Lerian logo mark only — the "Hub" wordmark/divider and the bell are
 *   hidden) on the left and the right cluster (theme · account) on the right. A
 *   second, full-width row holds the search pill so it stays a real, tappable
 *   target instead of collapsing to a sliver.
 * - **≥ sm:** a single balanced row — brand (with the "Hub" wordmark) on the
 *   left, a width-capped centered search pill, and the full right cluster
 *   (theme · bell · account). The ⌘K hint only appears from `sm` up.
 *
 * Implemented with one `flex-wrap` container: the search pill is ordered last
 * with `basis-full` on mobile (wrapping onto its own line) and resets to an
 * auto-basis centered element from `sm` up.
 *
 * The old subdomain indicator is intentionally dropped here — in HG3 the current
 * app lives in the URL / page, not in the bar.
 */
export function TopBar() {
  const { setOpen } = useSindarian();
  const hidden = useHideOnScrollDown();

  return (
    <header
      className={`sticky top-0 z-50 flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-container-surface px-4 py-2 transition-transform duration-300 sm:flex-nowrap sm:translate-y-0 sm:px-5 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* Left: Lerian brand mark. */}
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/"
          aria-label="Início do Hub"
          className="flex items-center gap-2 rounded outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LerianLogo className="h-[15px] text-body-title" />
          {/* Divider + "Hub" wordmark only have room from sm up. */}
          <span aria-hidden className="hidden h-4 w-px bg-border sm:block" />
          <span className="hidden text-[13px] font-semibold tracking-[-0.01em] text-muted-foreground sm:inline">
            Hub
          </span>
        </Link>
      </div>

      {/* Right: theme · notifications · account, grouped tightly. On mobile this
          shares the top row with the brand (search drops to row 2 below). */}
      <div className="order-2 ml-auto flex shrink-0 items-center gap-1 sm:order-3">
        <ThemeToggle />

        {/* The bell folds away on mobile to keep the top row uncrowded. */}
        <button
          type="button"
          aria-label="Notificações"
          className="hidden size-9 items-center justify-center rounded-full text-body-text outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:flex sm:size-8"
        >
          <Bell className="size-[17px]" />
        </button>

        <AccountMenu />
      </div>

      {/* Center: persistent search pill → opens the Sindarian assistant. On
          mobile it wraps to a full-width second row (order-3 / basis-full); from
          sm up it sits centered between brand and cluster. */}
      <div className="order-3 flex w-full min-w-0 basis-full justify-center sm:order-2 sm:w-auto sm:flex-1 sm:basis-auto">
        <button
          type="button"
          aria-label="Abrir a Sindarian"
          onClick={() => setOpen(true)}
          className="flex h-10 w-full min-w-0 items-center gap-2 rounded-full border border-shadcn-400 bg-container-surface py-1.5 pl-3.5 pr-2 text-left text-[12.5px] text-muted-foreground shadow-sm outline-none transition-colors hover:border-accent focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent-mute sm:h-auto sm:max-w-[480px]"
        >
          <span aria-hidden className="text-accent">
            ✦
          </span>
          <span className="min-w-0 flex-1 truncate">
            Buscar ou perguntar à Sindarian…
          </span>
          {/* ⌘K hint is hidden on small screens (no physical keyboard). */}
          <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  );
}

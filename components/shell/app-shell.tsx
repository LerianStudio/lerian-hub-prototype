"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { RouteGuard } from "@/components/auth/route-guard";
import { SindarianAssistant } from "@/components/shell/sindarian-assistant";
import { SindarianStateProvider } from "@/components/shell/sindarian-context";
import { TopBar } from "@/components/shell/top-bar";
import { WaffleLauncher } from "@/components/shell/waffle-launcher";
import { APPS, HOME_APP, type AppDef } from "@/lib/apps";

/** Resolve the current app from the pathname (longest route prefix wins). */
function currentApp(pathname: string): AppDef {
  if (pathname === "/") return HOME_APP;
  const match = APPS.filter((app) => pathname.startsWith(app.route)).sort(
    (a, b) => b.route.length - a.route.length,
  )[0];
  return match ?? HOME_APP;
}

/**
 * The authed shell: route guard + Sindarian assistant around the page content.
 * Rendered by the `(app)` route group layout, so `/login` (which lives outside
 * the group) gets none of this chrome.
 *
 * Chrome is contextual:
 * - **Home (`/`)**: the full top bar (brand · search · theme · account).
 * - **Inner apps**: no bar at all — just a discreet floating app launcher fixed
 *   in the corner, so each app reads as its own focused surface. The launcher's
 *   "Seus apps" grid includes Início, the way back to the Hub. The Sindarian
 *   assistant stays reachable everywhere via ⌘K / Ctrl+K.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const current = currentApp(pathname);
  const isHome = current.id === HOME_APP.id;

  return (
    <RouteGuard>
      <SindarianStateProvider>
        <div className="flex min-h-full flex-col bg-body-surface">
          {isHome ? <TopBar /> : null}
          <main className="flex-1">{children}</main>
        </div>
        {isHome ? null : (
          <div className="fixed right-4 top-4 z-50">
            <WaffleLauncher current={current} variant="floating" />
          </div>
        )}
        <SindarianAssistant />
      </SindarianStateProvider>
    </RouteGuard>
  );
}

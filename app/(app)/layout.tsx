import type { ReactNode } from "react";

import { AppShell } from "@/components/shell/app-shell";

/**
 * Layout for the authed route group. Everything here is wrapped in the shared
 * shell (top bar + Sindarian) behind the route guard. `/login` lives outside
 * this group and therefore renders with no chrome.
 */
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

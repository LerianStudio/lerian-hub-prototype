import type { ReactNode } from "react";

import { Card } from "@lerianstudio/sindarian-ui";

import { cn } from "@/lib/utils";

export interface KpiProps {
  /** The big number / value. */
  value: ReactNode;
  /** The descriptive label below it. */
  label: string;
  /** Tint the value with the system-error color (for critical KPIs). */
  tone?: "default" | "danger";
}

/** A single KPI tile: a large value over a muted label. */
export function Kpi({ value, label, tone = "default" }: KpiProps) {
  return (
    <Card className="gap-0 rounded-xl px-4 py-4 sm:px-[18px]">
      <div
        className={cn(
          "text-[26px] font-bold leading-none tracking-[-0.02em]",
          tone === "danger" ? "text-system-error" : "text-body-title",
        )}
      >
        {value}
      </div>
      <div className="mt-1.5 text-xs text-muted-foreground">{label}</div>
    </Card>
  );
}

/**
 * Responsive grid of KPI tiles: 2-up on mobile, then auto-fitting to as many
 * 150px columns as fit from sm up. The mobile `minmax(0,1fr)` lets tiles shrink
 * below their content width so two stay side-by-side down to 320px without
 * overflowing.
 */
export function KpiGrid({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] sm:gap-3.5">
      {children}
    </div>
  );
}

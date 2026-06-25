import type { ReactNode } from "react";

import { Card } from "@lerianstudio/sindarian-ui";

import { cn } from "@/lib/utils";

import { PANEL_HEADER_PADDING } from "@/components/ui-app/spacing";

export interface PanelProps {
  /** Panel header label (e.g. "Fila ativa"). */
  title: string;
  /** Optional action node rendered at the right of the header. */
  action?: ReactNode;
  /** Panel body — typically a stack of <Row> elements. */
  children: ReactNode;
  className?: string;
}

/**
 * A bordered surface with a header strip and a body. Generic container for the
 * row lists used across app pages.
 */
export function Panel({ title, action, children, className }: PanelProps) {
  return (
    <Card className={cn("gap-0 overflow-hidden rounded-[13px] py-0", className)}>
      <div
        className={cn(
          "flex items-center justify-between border-b",
          PANEL_HEADER_PADDING,
        )}
      >
        <span className="text-[13px] font-semibold text-container-title">
          {title}
        </span>
        {action}
      </div>
      <div>{children}</div>
    </Card>
  );
}

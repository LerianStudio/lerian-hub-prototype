import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ROW_PADDING } from "@/components/ui-app/spacing";

export interface RowProps {
  /** Mono leading id (e.g. "#4821", "v2.14.1", "◎"). Optional. */
  id?: ReactNode;
  /** Primary line. */
  title: ReactNode;
  /** Secondary muted line under the title. */
  sub?: ReactNode;
  /** Trailing content, typically a <Badge>. */
  right?: ReactNode;
}

/**
 * A list row: optional mono id column, a title/sub stack, and a trailing slot
 * (usually a Badge). Rows stack inside a <Panel> and self-divide with borders.
 */
export function Row({ id, title, sub, right }: RowProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 border-b text-sm last:border-b-0 sm:items-center sm:gap-3.5",
        ROW_PADDING,
      )}
    >
      {id !== undefined ? (
        <span className="mt-0.5 w-12 shrink-0 font-mono text-xs text-muted-foreground sm:mt-0 sm:w-16">
          {id}
        </span>
      ) : null}
      {/* Title/sub stack. On mobile the trailing badge stacks below it (the
          parent flex stays row, but the badge wraps under via a separate flex
          group), so titles get the full width and wrap to two lines instead of
          truncating hard. */}
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3.5">
        <div className="min-w-0 flex-1">
          <div className="text-body-title sm:truncate">{title}</div>
          {sub ? (
            <div className="text-xs text-muted-foreground sm:truncate">
              {sub}
            </div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}

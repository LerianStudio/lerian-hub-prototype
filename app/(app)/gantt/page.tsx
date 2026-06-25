import type { CSSProperties } from "react";

import { AppSubtitle, PageContainer, Panel, ScreenTitle } from "@/components/ui-app";
import { appById } from "@/lib/apps";

const app = appById("gantt");

/** Bar status → fill/border styling. All colors come from sindarian-ui tokens. */
type Status = "done" | "overdue" | "warning" | "future";

interface Task {
  /** Task label shown in the fixed 160px column. */
  label: string;
  /** Bar offset from the start of the track, as a percentage. */
  left: number;
  /** Bar length, as a percentage of the track width. */
  width: number;
  /** Schedule status, driving the bar color. */
  status: Status;
}

const TASKS: Task[] = [
  { label: "Kickoff", left: 2, width: 14, status: "done" },
  { label: "Setup de ambiente", left: 16, width: 22, status: "done" },
  { label: "Integração (API)", left: 38, width: 26, status: "overdue" },
  { label: "Migração de dados", left: 56, width: 22, status: "warning" },
  { label: "Go-live", left: 80, width: 16, status: "future" },
];

/** Inline style for a bar given its status — uses brand/semantic CSS vars. */
function barStyle(status: Status): CSSProperties {
  switch (status) {
    case "done":
      return { backgroundColor: "var(--color-de-york-600)" };
    case "overdue":
      return { backgroundColor: "var(--color-system-error)" };
    case "warning":
      return { backgroundColor: "var(--color-system-alert)" };
    case "future":
      return {
        backgroundColor: "transparent",
        border: "1px dashed var(--color-muted)",
      };
  }
}

/** Whether the bar's text/fill should read as on-dark (solid colored fills). */
function isSolid(status: Status): boolean {
  return status !== "future";
}

function GanttRow({ label, left, width, status }: Task) {
  return (
    <div className="grid grid-cols-[88px_1fr] items-center gap-3 sm:grid-cols-[160px_1fr]">
      <span className="truncate text-[13px] font-medium text-body-title">
        {label}
      </span>
      <div className="relative h-7 w-full overflow-hidden rounded-md bg-muted/60">
        <div
          className="absolute inset-y-0 rounded-md"
          style={{
            left: `${left}%`,
            width: `${width}%`,
            ...barStyle(status),
          }}
          role="presentation"
          aria-label={label}
        >
          <span
            className={
              isSolid(status)
                ? "flex h-full items-center px-2 text-[11px] font-semibold text-white"
                : "flex h-full items-center px-2 text-[11px] font-medium text-muted-foreground"
            }
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function GanttPage() {
  return (
    <PageContainer>
      <ScreenTitle
        glyph={app.glyph}
        color={app.color}
        darkGlyph={app.darkGlyph}
        title="Gantt · Acme"
        subtitle={<AppSubtitle extra="onboarding 72% · 2 tarefas atrasadas" />}
      />

      <Panel title="Cronograma de implementação">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-[18px]">
          {TASKS.map((task) => (
            <GanttRow key={task.label} {...task} />
          ))}
        </div>
      </Panel>
    </PageContainer>
  );
}

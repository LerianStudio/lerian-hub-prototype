"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lerianstudio/sindarian-ui";

import { AppIcon } from "@/components/ui-app/app-icon";
import { APPS, HOME_APP, type AppDef } from "@/lib/apps";
import { cn } from "@/lib/utils";

/** The "back to the Hub" entry shown first when you're inside an app. */
const HUB_ENTRY: AppDef = { ...HOME_APP, name: "Lerian HUB" };

interface WaffleLauncherProps {
  /** The current app, highlighted in the grid. */
  current: AppDef;
  /**
   * Visual style of the trigger:
   * - `bar` (default): a flat dot-grid button that sits inside the top bar.
   * - `floating`: an elevated, self-contained button for the discreet corner
   *   launcher shown on inner app pages (no top bar).
   */
  variant?: "bar" | "floating";
}

/**
 * The 3×3 "waffle" app launcher: a dot-grid button that opens a Popover holding
 * a Material-style grid of the Hub home + every app (colored glyph chip + name),
 * each a `<Link>` to its route. The current entry is highlighted.
 */
export function WaffleLauncher({ current, variant = "bar" }: WaffleLauncherProps) {
  const [open, setOpen] = useState(false);

  // Outside the Hub home, surface "Lerian HUB" as the first entry so there's
  // always a way back; on the home itself the entry would be redundant.
  const isHome = current.id === HOME_APP.id;
  const apps = isHome ? APPS : [HUB_ENTRY, ...APPS];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Abrir apps"
        className={cn(
          "flex items-center justify-center text-muted-foreground outline-none transition-colors hover:text-body-title focus-visible:ring-2 focus-visible:ring-ring",
          variant === "bar"
            ? "size-8 shrink-0 rounded-full hover:bg-muted"
            : "size-11 rounded-full border bg-container-surface shadow-lg hover:border-shadcn-400 hover:bg-muted",
        )}
      >
        <span aria-hidden className="grid grid-cols-3 grid-rows-3 gap-[3px]">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="size-[3px] rounded-full bg-current" />
          ))}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align={variant === "floating" ? "end" : "start"}
        collisionPadding={12}
        className="w-[calc(100vw-24px)] max-w-[256px] p-1.5"
      >
        <p className="px-1.5 pb-1 pt-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          Seus apps
        </p>
        <div className="grid grid-cols-3 gap-0.5">
          {apps.map((app) => {
            const isCurrent = app.id === current.id;
            return (
              <Link
                key={app.id}
                href={app.route}
                onClick={() => setOpen(false)}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-start gap-1.5 rounded-lg px-1 py-2 text-center outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                  isCurrent && "bg-accent-mute",
                )}
              >
                <AppIcon
                  glyph={app.glyph}
                  color={app.color}
                  darkGlyph={app.darkGlyph}
                  size="md"
                />
                <span className="line-clamp-2 min-h-[2.4em] text-[11px] font-medium leading-tight text-body-title">
                  {app.name}
                </span>
              </Link>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

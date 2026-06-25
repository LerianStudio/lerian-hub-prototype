"use client";

import Link from "next/link";
import { EllipsisVertical } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  toast,
} from "@lerianstudio/sindarian-ui";

import { AppIcon } from "@/components/ui-app/app-icon";
import { hideApp, showApp } from "@/lib/app-prefs";
import { type AppDef } from "@/lib/apps";

/**
 * Hide an app from the home and surface a toast with an "Desfazer" action that
 * restores it via `showApp`. Uses the sindarian-ui (Sonner-backed) toast.
 *
 * The toast `action` carries Sonner's native `{ label, onClick }` shape, which
 * Sonner renders as an accessible, focusable button. The sindarian-ui wrapper
 * types `action` as a `ReactElement`, so we cast this single object — Sonner
 * accepts both forms (`Action | ReactNode`) at runtime.
 */
function removeAppWithUndo(app: AppDef) {
  hideApp(app.id);
  toast({
    title: "App removido da home",
    description: app.name,
    action: {
      label: "Desfazer",
      onClick: () => showApp(app.id),
    } as never,
  });
}

/**
 * G2 — a large, center-aligned Material launcher tile (Workspace "Apps" idiom):
 * a big colored glyph chip on top, the app name, and a one-line real state.
 * The whole tile is a `<Link>` into the app, with a subtle hover elevation.
 *
 * The tile carries an always-visible ⋯ menu whose pointer events are isolated so
 * opening it never navigates the `<Link>`. Reordering is handled in the
 * manage-apps modal, so the tile itself is not draggable.
 */
export function AppTile({ app }: { app: AppDef }) {
  return (
    <div className="group relative">
      <Link
        href={app.route}
        className="flex min-h-[164px] flex-col items-center justify-center gap-3.5 rounded-2xl border bg-container-surface px-5 py-8 text-center text-body-title shadow-sm outline-none transition-all duration-150 hover:-translate-y-1 hover:border-shadcn-400 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
      >
        <AppIcon
          glyph={app.glyph}
          color={app.color}
          darkGlyph={app.darkGlyph}
          size="xl"
        />
        <span className="text-[15.5px] font-semibold leading-tight">
          {app.name}
        </span>
        <span className="text-[12.5px] leading-snug text-muted-foreground">
          {app.tile}
        </span>
      </Link>

      <AppTileMenu app={app} />
    </div>
  );
}

/**
 * The per-card ⋯ menu. It sits above the tile `<Link>` and stops click
 * propagation so opening it never navigates the link.
 */
function AppTileMenu({ app }: { app: AppDef }) {
  return (
    <div
      className="absolute right-2 top-2"
      // Block link navigation originating in the menu region.
      onClick={(event) => event.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Opções do app"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-shadcn-100 hover:text-body-title focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-shadcn-100 data-[state=open]:text-body-title"
        >
          <EllipsisVertical className="size-4" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => removeAppWithUndo(app)}
          >
            Remover da home
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** The dashed "＋ Adicionar app" launcher tile — opens the manage-apps modal. */
export function AddAppTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[164px] flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed px-5 py-8 text-center text-muted-foreground outline-none transition-colors hover:border-shadcn-400 hover:text-body-title focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span aria-hidden className="text-[30px] leading-none">
        ＋
      </span>
      <span className="text-[13.5px] font-medium">Adicionar app</span>
    </button>
  );
}

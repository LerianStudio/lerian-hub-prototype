"use client";

import { useState } from "react";

import { Button } from "@lerianstudio/sindarian-ui";

import { AddAppTile, AppTile } from "@/components/home/app-tile";
import { ManageAppsDialog } from "@/components/home/manage-apps-dialog";
import { useAppPrefs } from "@/lib/app-prefs";
import { appById } from "@/lib/apps";

/**
 * The "Seus apps" grid: renders the visible apps in the user's stored order as
 * plain (non-draggable) launcher tiles, exposes a per-tile ⋯ menu to remove
 * apps from the home, and an "Adicionar app" tile that opens the manage-apps
 * modal. Reordering lives inside that modal (not on the grid).
 *
 * Visibility/order come from the SSR-safe prefs store, so the server renders the
 * deterministic registry default and the persisted layout applies after mount
 * without a hydration mismatch (same idiom as `Greeting`/theme).
 */
export function AppGrid() {
  const prefs = useAppPrefs();
  const [manageOpen, setManageOpen] = useState(false);

  const hidden = new Set(prefs.hidden);
  const visibleIds = prefs.order.filter((id) => !hidden.has(id));

  return (
    <>
      <h2 className="mb-5 mt-9 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        Seus apps
      </h2>

      {visibleIds.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-14 text-center">
          <p className="text-sm text-muted-foreground">
            Você ocultou todos os apps da home.
          </p>
          <Button variant="outline" onClick={() => setManageOpen(true)}>
            Gerenciar apps
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleIds.map((id) => (
            <AppTile key={id} app={appById(id)} />
          ))}
          <AddAppTile onClick={() => setManageOpen(true)} />
        </div>
      )}

      <ManageAppsDialog open={manageOpen} onOpenChange={setManageOpen} />
    </>
  );
}

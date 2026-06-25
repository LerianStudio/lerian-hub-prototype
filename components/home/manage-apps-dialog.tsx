"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Switch,
} from "@lerianstudio/sindarian-ui";

import { AppIcon } from "@/components/ui-app/app-icon";
import { reorder, toggleApp, useAppPrefs } from "@/lib/app-prefs";
import { APPS, type AppDef, appById } from "@/lib/apps";
import { cn } from "@/lib/utils";

/**
 * id of the keyboard-reorder hint. Wired onto the sortable list via
 * `aria-describedby`. (We deliberately do NOT add it to the drag handles —
 * dnd-kit already sets its own `aria-describedby` there pointing at its
 * auto-generated keyboard instructions, which we must not clobber.)
 */
const REORDER_HINT_ID = "manage-apps-reorder-hint";

/**
 * The "Gerenciar apps" modal. Lists every registry app and lets the user:
 * - toggle whether each app appears on the home grid (the switch), and
 * - reorder the apps by dragging the handle (pointer + keyboard); the new order
 *   is the order used by the home grid.
 *
 * Both actions write straight to the shared SSR-safe prefs store, so the home
 * grid reflects each change live (and vice-versa). Order is preserved for hidden
 * apps too — dragging a row never depends on its active/inactive state.
 */
export function ManageAppsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const prefs = useAppPrefs();
  const hidden = new Set(prefs.hidden);

  // Show apps in the user's current order; fall back to registry order for any
  // ids not present (reconcile guarantees parity, this is just defensive).
  const ordered = prefs.order
    .map((id) => appById(id))
    .filter((app) => app.id !== "home");
  const knownIds = new Set(ordered.map((app) => app.id));
  const apps = [...ordered, ...APPS.filter((app) => !knownIds.has(app.id))];

  const sortableIds = apps.map((app) => app.id);
  const activeCount = apps.filter((app) => !hidden.has(app.id)).length;

  const sensors = useSensors(
    // A small activation distance keeps the switch tappable while a deliberate
    // drag on the handle still starts cleanly.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorder(String(active.id), String(over.id));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Gerenciar apps</DialogTitle>
          <DialogDescription>
            Escolha quais apps aparecem na sua home e arraste para reordenar.{" "}
            {activeCount} de {apps.length} ativos.
          </DialogDescription>
        </DialogHeader>

        {/* Discoverability + a11y: announce that rows are keyboard-sortable. The
            hint is associated with the list via aria-describedby. */}
        <p id={REORDER_HINT_ID} className="px-1 text-[12px] text-muted-foreground">
          Arraste ou use as setas do teclado para reordenar.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <ul
            role="list"
            aria-describedby={REORDER_HINT_ID}
            className="-mx-1 max-h-[60vh] overflow-y-auto py-1"
          >
            <SortableContext
              items={sortableIds}
              strategy={verticalListSortingStrategy}
            >
              {apps.map((app) => (
                <SortableAppRow
                  key={app.id}
                  app={app}
                  active={!hidden.has(app.id)}
                />
              ))}
            </SortableContext>
          </ul>
        </DndContext>
      </DialogContent>
    </Dialog>
  );
}

/** A single draggable row: drag handle + icon + name/state + visibility switch. */
function SortableAppRow({ app, active }: { app: AppDef; active: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id });

  const switchId = `manage-app-${app.id}`;

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "flex items-center gap-2 rounded-xl px-2 py-2.5 transition-colors hover:bg-shadcn-100/60",
        isDragging && "relative z-10 bg-container-surface shadow-lg",
      )}
    >
      <button
        type="button"
        // Only the handle carries the drag listeners, so the switch never starts
        // a drag and a drag never toggles the switch.
        {...attributes}
        {...listeners}
        aria-label={`Reordenar ${app.name}`}
        className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-shadcn-100 hover:text-body-title focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
      >
        <GripVertical className="size-4" aria-hidden />
      </button>

      <AppIcon
        glyph={app.glyph}
        color={app.color}
        darkGlyph={app.darkGlyph}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={switchId}
          className="block cursor-pointer truncate text-[14px] font-medium text-body-title"
        >
          {app.name}
        </label>
        <span className="block truncate text-[12px] text-muted-foreground">
          {active ? "Ativo na home" : "Oculto da home"}
        </span>
      </div>
      <Switch
        id={switchId}
        checked={active}
        onCheckedChange={() => toggleApp(app.id)}
        aria-label={`${active ? "Ocultar" : "Mostrar"} ${app.name} na home`}
      />
    </li>
  );
}

"use client";

import { useSyncExternalStore } from "react";

import { CURRENT_USER } from "@/lib/apps";
import { cn } from "@/lib/utils";

/** Time-of-day greeting in pt-BR. */
function greetingFor(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

/** Uppercase only the first character, leaving the rest of the string as-is. */
function capitalizeFirst(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// A client-only "is mounted" store: server renders `false`, the client renders
// `true` after hydration. This reads the local clock without a setState effect.
const noopSubscribe = () => () => {};

function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * Client-side greeting + date line. Computed on the client so it reflects the
 * viewer's local time; renders a stable placeholder during SSR/hydration.
 *
 * `center` (used by the G2 launcher home) center-aligns the block and tones the
 * heading down so it stays lighter than the app tiles below it.
 */
export function Greeting({ center = false }: { center?: boolean }) {
  const isClient = useIsClient();
  const now = isClient ? new Date() : null;

  const firstName = CURRENT_USER.name.split(" ")[0];
  const greeting = now ? greetingFor(now.getHours()) : "Olá";
  // pt-BR renders the weekday/month lowercase (e.g. "quinta-feira, 25 de
  // junho"); we capitalize only the very first character for a natural,
  // sentence-style line — never a per-word `capitalize` transform.
  const dateLine = now
    ? capitalizeFirst(
        now.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
      )
    : "";

  return (
    <div className={cn(center && "text-center")}>
      <h1
        className={cn(
          "tracking-[-0.02em] text-body-title",
          center
            ? "text-[24px] font-semibold sm:text-[28px]"
            : "text-[23px] font-bold sm:text-[27px]",
        )}
      >
        {greeting}, {firstName} <span className="text-accent">👋</span>
      </h1>
      <p className="mt-1.5 min-h-[20px] text-[14px] text-muted-foreground">
        {dateLine}
      </p>
    </div>
  );
}

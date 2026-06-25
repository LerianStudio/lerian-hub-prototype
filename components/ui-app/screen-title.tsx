import type { ReactNode } from "react";

import { AppIcon } from "@/components/ui-app/app-icon";

export interface ScreenTitleProps {
  /** App glyph shown in the colored icon chip. */
  glyph: string;
  /** Accent color (brand palette CSS var) for the icon chip. */
  color: string;
  /** Use a dark glyph for light accent colors. */
  darkGlyph?: boolean;
  /** Page heading. */
  title: string;
  /** Supporting subtitle line (string or rich nodes for bold fragments). */
  subtitle?: ReactNode;
}

/**
 * Standard page header: colored app glyph + h1 + subtitle. Reused by every app
 * page. The app subtitle convention is documented in the build spec, e.g.
 * "Deploy próprio · app independente · logado via SSO como …".
 */
export function ScreenTitle({
  glyph,
  color,
  darkGlyph,
  title,
  subtitle,
}: ScreenTitleProps) {
  return (
    <header className="mb-6">
      <div className="mb-1.5 flex items-center gap-3">
        <AppIcon glyph={glyph} color={color} darkGlyph={darkGlyph} size="lg" />
        <h1 className="text-[21px] font-bold tracking-[-0.02em] text-body-title sm:text-[25px]">
          {title}
        </h1>
      </div>
      {subtitle ? (
        <p className="text-[13px] text-muted-foreground">{subtitle}</p>
      ) : null}
    </header>
  );
}

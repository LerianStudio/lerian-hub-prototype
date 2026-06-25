import { cn } from "@/lib/utils";

export interface AppIconProps {
  /** The glyph character (e.g. "✦", "▦"). */
  glyph: string;
  /** CSS color value for the chip background (brand palette token). */
  color: string;
  /** Use dark glyph text instead of white (for light accent colors). */
  darkGlyph?: boolean;
  /** Visual size of the rounded chip. */
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES: Record<NonNullable<AppIconProps["size"]>, string> = {
  sm: "size-[22px] rounded-[7px] text-xs",
  md: "size-[30px] rounded-[9px] text-sm",
  lg: "size-10 rounded-[11px] text-lg shadow-sm",
  xl: "size-14 rounded-[15px] text-2xl shadow-sm",
};

/**
 * The colored rounded-square app glyph used across the shell, launcher cards
 * and screen titles. The accent color is applied as an inline background so it
 * can come straight from the app registry's CSS-variable `color` value.
 */
export function AppIcon({
  glyph,
  color,
  darkGlyph = false,
  size = "md",
  className,
}: AppIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-medium",
        SIZES[size],
        className,
      )}
      style={{
        backgroundColor: color,
        color: darkGlyph ? "hsl(var(--accent-foreground))" : "#ffffff",
      }}
    >
      {glyph}
    </span>
  );
}

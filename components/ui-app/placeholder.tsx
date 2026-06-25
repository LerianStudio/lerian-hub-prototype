import { AppIcon } from "@/components/ui-app/app-icon";

export interface PlaceholderProps {
  /** App glyph shown in the large centered chip. */
  glyph: string;
  /** Accent color (brand palette CSS var) for the icon chip. */
  color: string;
  /** Use a dark glyph for light accent colors. */
  darkGlyph?: boolean;
  /** Illustrative production subdomain of the standalone app. */
  subdomain: string;
  /** App-specific descriptive line (e.g. what it would contain). */
  description: string;
}

/**
 * Centered placeholder body for app routes that, in production, are their own
 * independent deploy at their own subdomain (authenticated via SSO). Used by
 * placeholder-style app pages such as Onboarding. All copy is illustrative.
 */
export function Placeholder({
  glyph,
  color,
  darkGlyph,
  subdomain,
  description,
}: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-[18px] py-16 text-center">
      <AppIcon glyph={glyph} color={color} darkGlyph={darkGlyph} size="xl" />
      <p className="max-w-[420px] text-[13px] leading-relaxed text-muted-foreground">
        {description} Em produção, um{" "}
        <b className="font-semibold">deploy próprio</b> em{" "}
        <span className="font-mono text-[12px]">{subdomain}</span>, autenticado
        via SSO.
      </p>
    </div>
  );
}

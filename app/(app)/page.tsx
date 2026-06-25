import { Greeting } from "@/components/home/greeting";
import { ClientStatus } from "@/components/home/client-status";
import { AppGrid } from "@/components/home/app-grid";

/**
 * G2 — the Workspace-style Material launcher home. A modest centered greeting
 * sits above a state-aware client-status section, then a width-capped grid of
 * large app tiles (glyph chip + name + one-line real state), each linking into
 * its app, plus a dashed "Adicionar app" tile.
 *
 * The block is top-aligned (not vertically centered): with the client-status
 * section added there is now enough content that centering would clip it on
 * shorter viewports, so it flows naturally from the top and scrolls.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-start px-6 pb-16 pt-10 sm:pt-14">
      <div className="w-full max-w-[880px]">
        <Greeting center />

        <ClientStatus />

        <AppGrid />
      </div>
    </div>
  );
}

"use client";

import { Lock } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { LerianLogo } from "@/components/shell/lerian-logo";
import { AppIcon } from "@/components/ui-app/app-icon";
import { APPS } from "@/lib/apps";

// Login shows every app glyph. Fixed-width cells keep icons aligned per row;
// the wrapping flex centers a partial last row for any app count.

export default function LoginPage() {
  const { signIn } = useAuth();

  // signIn POSTs /api/auth/login then navigates (returnTo ?? "/") itself.
  // The proxy already keeps already-signed-in users off this page server-side.
  // returnTo wiring is polished in task 1.3.2.
  function handleSignIn() {
    void signIn();
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(130% 80% at 50% -10%, var(--color-accent-mute), transparent 55%), hsl(var(--body-surface))",
      }}
    >
      <div className="w-full max-w-[430px] rounded-[20px] border bg-container-surface p-[34px] py-10 text-center shadow-lg">
        <LerianLogo className="mx-auto mb-7 h-5 text-body-title" />

        <div
          aria-hidden
          className="mx-auto mb-[18px] flex size-[60px] items-center justify-center rounded-[18px] bg-accent text-[30px] text-accent-foreground shadow-md"
        >
          ✦
        </div>

        <h1 className="mb-1.5 text-[22px] font-bold tracking-[-0.02em] text-body-title">
          Lerian Hub
        </h1>
        <p className="mb-[26px] text-[13.5px] leading-relaxed text-muted-foreground">
          Um acesso para todas as ferramentas Lerian.
        </p>

        <button
          type="button"
          onClick={handleSignIn}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-accent p-[13px] text-[14.5px] font-semibold text-accent-foreground outline-none transition-[filter] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Lock className="size-4" aria-hidden />
          Entrar com a conta Lerian
        </button>

        <button
          type="button"
          onClick={handleSignIn}
          className="mt-2.5 flex w-full items-center justify-center gap-2.5 rounded-xl border border-shadcn-400 bg-secondary p-3 text-[13.5px] font-medium text-body-title outline-none transition-colors hover:border-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span aria-hidden className="font-bold">
            G
          </span>
          Continuar com Google
        </button>

        <div className="my-[18px] flex items-center gap-3 text-[11px] text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          acesso único · SSO
        </div>

        <div className="mb-1 mt-[26px] flex flex-wrap justify-center gap-x-2 gap-y-3">
          {APPS.map((app) => (
            <div
              key={app.id}
              className="flex w-[60px] flex-col items-center gap-1.5"
            >
              <AppIcon
                glyph={app.glyph}
                color={app.color}
                darkGlyph={app.darkGlyph}
                size="md"
              />
              <span className="text-center text-[10px] leading-tight text-muted-foreground">
                {app.name}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-[11.5px] text-muted-foreground">
          <Lock className="size-2.5" aria-hidden />
          <span className="font-mono">hub.lerian.studio</span>
        </p>
      </div>
    </div>
  );
}

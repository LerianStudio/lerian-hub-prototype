"use client";

import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lerianstudio/sindarian-ui";

import { useAuth } from "@/components/auth/auth-provider";

const AVATAR_GRADIENT =
  "linear-gradient(135deg, var(--color-sunglow-400), var(--color-vivid-tangerine-400))";

/** Round gradient avatar with the user's initials. */
function Avatar({ initials, size = 34 }: { initials: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-accent-foreground"
      style={{
        width: size,
        height: size,
        fontSize: size <= 34 ? 13 : 15,
        background: AVATAR_GRADIENT,
      }}
    >
      {initials}
    </span>
  );
}

/**
 * The account avatar in the top bar, opening a dropdown with the SSO identity
 * and a "Sair de todos os apps" (sign out everywhere) action.
 *
 * Identity comes from the cookie session via `useAuth()`. The menu lives behind
 * the auth guard so `session` is normally present; if it is null (e.g. a torn
 * session mid-logout) we render nothing rather than crash.
 */
export function AccountMenu() {
  const { session, signOut } = useAuth();
  const router = useRouter();

  function handleLogout() {
    // signOut POSTs /api/auth/logout, broadcasts cross-tab logout, then routes
    // to /login itself (provider owns navigation now).
    void signOut();
  }

  if (!session) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Conta de ${session.name}`}
        className="rounded-full outline-none ring-2 ring-border transition-shadow hover:ring-shadcn-400 focus-visible:ring-ring"
      >
        <Avatar initials={session.initials} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <div className="flex items-center gap-3 p-2.5">
          <Avatar initials={session.initials} size={42} />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-body-title">
              {session.name}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {session.email}
            </div>
          </div>
        </div>
        <div className="border-b px-2.5 pb-2.5 font-mono text-[11px] text-muted-foreground">
          🔒 Conta única Lerian · SSO
        </div>
        <DropdownMenuItem
          onSelect={() => router.push("/config")}
          className="mt-1.5 cursor-pointer gap-2 py-2.5 text-[13.5px] font-medium"
        >
          <Settings className="size-4" aria-hidden />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={handleLogout}
          className="cursor-pointer py-2.5 text-[13.5px] font-medium"
        >
          Sair de todos os apps
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

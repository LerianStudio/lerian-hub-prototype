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
import { CURRENT_USER } from "@/lib/apps";

const AVATAR_GRADIENT =
  "linear-gradient(135deg, var(--color-sunglow-400), var(--color-vivid-tangerine-400))";

/** Round gradient avatar with the user's initials. */
function Avatar({ size = 34 }: { size?: number }) {
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
      {CURRENT_USER.initials}
    </span>
  );
}

/**
 * The account avatar in the top bar, opening a dropdown with the SSO identity
 * and a "Sair de todos os apps" (sign out everywhere) action.
 */
export function AccountMenu() {
  const { signOut } = useAuth();
  const router = useRouter();

  function handleLogout() {
    signOut();
    router.replace("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Conta de ${CURRENT_USER.name}`}
        className="rounded-full outline-none ring-2 ring-border transition-shadow hover:ring-shadcn-400 focus-visible:ring-ring"
      >
        <Avatar />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <div className="flex items-center gap-3 p-2.5">
          <Avatar size={42} />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-body-title">
              {CURRENT_USER.name}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {CURRENT_USER.email}
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

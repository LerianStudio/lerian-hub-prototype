"use client";

import type { ReactNode } from "react";

import { Toaster, TooltipProvider } from "@lerianstudio/sindarian-ui";

import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider, useTheme } from "@/components/theme/theme-provider";

/**
 * App-wide client providers, composed in the order recommended by the Ring
 * frontend standards: session/auth (outermost) → theme → Radix tooltip context.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        {/* Sonner-backed toast region (sindarian-ui). Lives inside ThemeProvider
            so it follows the resolved light/dark theme. */}
        <ThemedToaster />
      </ThemeProvider>
    </AuthProvider>
  );
}

/** The sindarian-ui Toaster, themed from the resolved app theme. */
function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster theme={resolvedTheme} />;
}

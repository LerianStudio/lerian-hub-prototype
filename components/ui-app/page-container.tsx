import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { PAGE_PADDING } from "@/components/ui-app/spacing";

/** Centered, max-width content column used by every app page. */
export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1000px]", PAGE_PADDING)}>
      {children}
    </div>
  );
}

import { CURRENT_USER } from "@/lib/apps";

/**
 * The standard app-page subtitle:
 *   "App independente · SSO como <email>"
 * with an optional leading fragment (e.g. "onboarding 72% · 2 tarefas atrasadas").
 */
export function AppSubtitle({ extra }: { extra?: string }) {
  return (
    <>
      {extra ? (
        <>
          {extra}
          {" · "}
        </>
      ) : null}
      <b className="font-semibold">App independente</b> · SSO como{" "}
      {CURRENT_USER.email}
    </>
  );
}

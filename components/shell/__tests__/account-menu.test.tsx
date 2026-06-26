/**
 * Behavioral tests for the account menu's session-driven identity
 * (Task 1.3.2, RED→GREEN).
 *
 * The menu renders session.name / session.email / session.initials from
 * useAuth() (no hardcoded CURRENT_USER for display) and calls the provider's
 * signOut() from "Sair de todos os apps". If session is null it renders a
 * minimal placeholder rather than crashing.
 *
 * `useAuth` and `next/navigation` are mocked. The Radix dropdown is opened via
 * a click on the trigger so the menu content mounts.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AccountMenu } from "@/components/shell/account-menu";
import type { SessionUser } from "@/components/auth/auth-provider";

const signOut = vi.fn();
const push = vi.fn();

let session: SessionUser | null = null;

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({ session, signOut }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const SESSION: SessionUser = {
  userId: "mock:ana.lima@lerian.studio",
  email: "ana.lima@lerian.studio",
  name: "Ana Lima",
  initials: "AL",
  role: "Product Manager",
  company: "Lerian",
  locale: "pt-BR",
};

beforeEach(() => {
  signOut.mockReset();
  signOut.mockResolvedValue(undefined);
  push.mockReset();
  session = SESSION;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("AccountMenu — session identity", () => {
  it("renders the session name and email from the provider", async () => {
    const user = userEvent.setup();
    render(<AccountMenu />);

    await user.click(screen.getByRole("button", { name: /conta de ana lima/i }));

    expect(await screen.findByText("Ana Lima")).toBeInTheDocument();
    expect(screen.getByText("ana.lima@lerian.studio")).toBeInTheDocument();
  });

  it("renders the session initials in the avatar", () => {
    render(<AccountMenu />);
    // Initials appear in the trigger avatar even before the menu opens.
    expect(screen.getAllByText("AL").length).toBeGreaterThan(0);
  });

  it("does not render the hardcoded mock identity", async () => {
    const user = userEvent.setup();
    render(<AccountMenu />);

    await user.click(screen.getByRole("button", { name: /conta de ana lima/i }));

    expect(screen.queryByText("Daniel Antunes")).not.toBeInTheDocument();
  });
});

describe("AccountMenu — signOut", () => {
  it("calls the provider signOut from 'Sair de todos os apps'", async () => {
    const user = userEvent.setup();
    render(<AccountMenu />);

    await user.click(screen.getByRole("button", { name: /conta de ana lima/i }));
    await user.click(
      await screen.findByText(/sair de todos os apps/i),
    );

    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

describe("AccountMenu — null session", () => {
  it("does not crash when session is null", () => {
    session = null;
    expect(() => render(<AccountMenu />)).not.toThrow();
    expect(screen.queryByText("Ana Lima")).not.toBeInTheDocument();
  });
});

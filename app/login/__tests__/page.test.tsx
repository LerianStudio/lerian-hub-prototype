/**
 * Behavioral tests for the login page's returnTo wiring + pending state
 * (Task 1.3.2, RED→GREEN).
 *
 * The page reads `returnTo` from the query string via useSearchParams and
 * calls signIn(returnTo) — sanitized so only same-origin paths (starting with
 * "/") are honored; anything else defaults to "/". While the signIn POST is in
 * flight the buttons disable and show a pending label ("Entrando…").
 *
 * `useAuth` and `next/navigation`'s useSearchParams are mocked; signIn is a
 * controllable async spy so we can observe the in-flight state.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "@/app/login/page";

const signIn = vi.fn();

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({ signIn }),
}));

let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
}));

beforeEach(() => {
  signIn.mockReset();
  signIn.mockResolvedValue(undefined);
  searchParams = new URLSearchParams();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("LoginPage — returnTo wiring", () => {
  it("passes a sanitized same-origin returnTo to signIn", async () => {
    searchParams = new URLSearchParams("returnTo=/sla");
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(
      screen.getByRole("button", { name: /entrar com a conta lerian/i }),
    );

    expect(signIn).toHaveBeenCalledWith("/sla");
  });

  it("defaults to '/' when returnTo is absent", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(
      screen.getByRole("button", { name: /entrar com a conta lerian/i }),
    );

    expect(signIn).toHaveBeenCalledWith("/");
  });

  it("rejects an external returnTo (open-redirect) and defaults to '/'", async () => {
    searchParams = new URLSearchParams("returnTo=https://evil.com");
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(
      screen.getByRole("button", { name: /entrar com a conta lerian/i }),
    );

    expect(signIn).toHaveBeenCalledWith("/");
  });

  it("rejects a protocol-relative returnTo (//evil.com) and defaults to '/'", async () => {
    searchParams = new URLSearchParams("returnTo=//evil.com");
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(
      screen.getByRole("button", { name: /entrar com a conta lerian/i }),
    );

    expect(signIn).toHaveBeenCalledWith("/");
  });

  it("the Google button also signs in with the sanitized returnTo", async () => {
    searchParams = new URLSearchParams("returnTo=/tickets");
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(
      screen.getByRole("button", { name: /continuar com google/i }),
    );

    expect(signIn).toHaveBeenCalledWith("/tickets");
  });
});

describe("LoginPage — pending state", () => {
  it("disables the button and shows a pending label while signIn is in flight", async () => {
    let resolveSignIn: (() => void) | undefined;
    signIn.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSignIn = resolve;
        }),
    );
    const user = userEvent.setup();

    render(<LoginPage />);

    const primary = screen.getByRole("button", {
      name: /entrar com a conta lerian/i,
    });
    await user.click(primary);

    // In flight: pending label visible, button disabled.
    const pending = await screen.findByRole("button", { name: /entrando/i });
    expect(pending).toBeDisabled();

    // Resolve the POST → pending state clears.
    resolveSignIn?.();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /entrar com a conta lerian/i }),
      ).not.toBeDisabled(),
    );
  });
});

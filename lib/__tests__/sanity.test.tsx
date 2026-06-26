import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

// Sanity check: proves the Vitest + Testing Library + jsdom harness works.
// - globals are enabled (describe/it/expect available)
// - jest-dom matchers are loaded (toBeInTheDocument)
// - React rendering into jsdom works
describe("test harness", () => {
  it("runs arithmetic", () => {
    expect(1 + 1).toBe(2);
  });

  it("renders React into jsdom with jest-dom matchers", () => {
    render(<p>hub harness ok</p>);
    expect(screen.getByText("hub harness ok")).toBeInTheDocument();
  });
});

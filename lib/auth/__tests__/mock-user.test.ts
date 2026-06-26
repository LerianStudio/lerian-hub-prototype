/**
 * @vitest-environment node
 *
 * Tests for the seeded mock identity and `buildMockSession()`.
 *
 * Runs under `node` (not jsdom) so it can sit alongside jose-using suites
 * without realm hazards; these are pure-data assertions with no DOM. The seed
 * is the single source of the demo user (re-exported from lib/apps.ts as
 * CURRENT_USER), and `buildMockSession()` projects it onto the HubSession
 * identity-claim contract (userId/email/name/initials/role/company/locale —
 * everything except the iat/exp timing claims that signSession stamps).
 */
import { describe, it, expect } from "vitest";
import { MOCK_USER, buildMockSession } from "@/lib/auth/mock-user";
import type { HubSessionClaims } from "@/lib/auth/jwt";

describe("MOCK_USER seed", () => {
  it("carries the demo identity fields", () => {
    expect(MOCK_USER.name).toBe("Daniel Antunes");
    expect(MOCK_USER.email).toBe("daniel.antunes@lerian.studio");
    expect(MOCK_USER.initials).toBe("DA");
    expect(MOCK_USER.role).toBe("Engenheiro de Software");
    expect(MOCK_USER.company).toBe("Lerian");
  });

  it("is re-exported from lib/apps as CURRENT_USER (single source)", async () => {
    const { CURRENT_USER } = await import("@/lib/apps");
    expect(CURRENT_USER).toBe(MOCK_USER);
  });
});

describe("buildMockSession", () => {
  it("projects the seed onto the HubSession identity-claim contract", () => {
    const claims: HubSessionClaims = buildMockSession();

    // Carried straight through from the seed.
    expect(claims.email).toBe(MOCK_USER.email);
    expect(claims.name).toBe(MOCK_USER.name);
    expect(claims.initials).toBe(MOCK_USER.initials);
    expect(claims.role).toBe(MOCK_USER.role);
    expect(claims.company).toBe(MOCK_USER.company);

    // Derived claims required by HubSession but not present on the seed.
    expect(typeof claims.userId).toBe("string");
    expect(claims.userId.length).toBeGreaterThan(0);
    expect(typeof claims.locale).toBe("string");
    expect(claims.locale.length).toBeGreaterThan(0);
  });

  it("omits the timing claims (iat/exp are stamped by signSession)", () => {
    const claims = buildMockSession();
    expect("iat" in claims).toBe(false);
    expect("exp" in claims).toBe(false);
  });

  it("is deterministic — same claims on every call", () => {
    expect(buildMockSession()).toEqual(buildMockSession());
  });
});

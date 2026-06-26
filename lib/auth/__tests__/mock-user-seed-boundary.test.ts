/**
 * @vitest-environment node
 *
 * Regression for BUG 2 — "CURRENT_USER is not defined" on a normal F5.
 *
 * Root cause was NOT a classic circular import (the auth runtime never imports
 * lib/apps). It was a server/client module-BOUNDARY problem: lib/apps.ts
 * re-exported CURRENT_USER from a module (lib/auth/mock-user.ts) that
 * transitively pulls the auth runtime — lib/auth/jwt.ts → `jose` +
 * lib/auth/config.ts (which reads process.env). Because the CURRENT_USER
 * consumers are "use client" components, that barrel re-export dragged the auth
 * runtime into the client bundle; under Turbopack's warm chunk-init order the
 * re-exported binding could resolve to `undefined`.
 *
 * The fix moves the seed into a leaf data module (lib/auth/mock-user-seed.ts)
 * with ZERO imports, and both lib/apps.ts (UI side) and lib/auth/mock-user.ts
 * (the session builder, auth-runtime side) import that leaf. This suite locks
 * that invariant in two ways:
 *   1. The seed is always a defined object with the expected fields when reached
 *      through the lib/apps barrel — i.e. CURRENT_USER is never undefined.
 *   2. The leaf seed module declares no imports of the auth runtime or lib/apps,
 *      so a client consumer can never pull `jose`/process.env through it.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

describe("BUG 2 — CURRENT_USER is a defined seed via the lib/apps barrel", () => {
  it("resolves CURRENT_USER to a defined object with the demo fields", async () => {
    const { CURRENT_USER } = await import("@/lib/apps");

    expect(CURRENT_USER).toBeDefined();
    expect(typeof CURRENT_USER).toBe("object");
    expect(CURRENT_USER.name).toBe("Daniel Antunes");
    expect(CURRENT_USER.email).toBe("daniel.antunes@lerian.studio");
    expect(CURRENT_USER.initials).toBe("DA");
    // Profile fields the account-settings form pre-fills from the seed.
    expect(CURRENT_USER.firstName).toBe("Daniel");
    expect(CURRENT_USER.phone).toBeTruthy();
    expect(CURRENT_USER.department).toBeTruthy();
  });

  it("keeps the single-source identity: lib/apps CURRENT_USER === the leaf seed", async () => {
    const { CURRENT_USER } = await import("@/lib/apps");
    const { MOCK_USER } = await import("@/lib/auth/mock-user-seed");
    expect(CURRENT_USER).toBe(MOCK_USER);
  });
});

describe("BUG 2 — the seed leaf module pulls no auth runtime / barrel", () => {
  it("lib/auth/mock-user-seed.ts declares no runtime imports", () => {
    const seedPath = fileURLToPath(
      new URL("../mock-user-seed.ts", import.meta.url),
    );
    const source = readFileSync(seedPath, "utf8");

    // A leaf data module: it must not import the auth runtime (jwt/config),
    // `jose`, or the lib/apps barrel — those are exactly the edges that dragged
    // server-only code into the client bundle and produced the undefined
    // binding. (A type-only import would still route a client consumer through
    // the auth tree's module graph, so forbid those edges entirely here.)
    expect(source).not.toMatch(/from\s+["']@\/lib\/apps["']/);
    expect(source).not.toMatch(/from\s+["']@\/lib\/auth\/jwt["']/);
    expect(source).not.toMatch(/from\s+["']@\/lib\/auth\/config["']/);
    expect(source).not.toMatch(/from\s+["']jose["']/);
  });
});

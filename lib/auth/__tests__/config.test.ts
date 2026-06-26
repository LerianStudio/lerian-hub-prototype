/**
 * Tests for the auth config module — the single place that reads auth env vars.
 *
 * `resolveAuthConfig(env)` takes an injected env object so we can exercise
 * every branch without mutating the real `process.env`. We mirror
 * operations-center's fail-closed behavior: google mode demands a real secret
 * (≥ 32 chars) or the module throws at resolution time.
 */
import { describe, it, expect } from "vitest";
import { resolveAuthConfig } from "@/lib/auth/config";

describe("resolveAuthConfig", () => {
  describe("mock mode (default)", () => {
    it("resolves with safe defaults when no env is set", () => {
      const config = resolveAuthConfig({});

      expect(config.mode).toBe("mock");
      // Mock mode falls back to a fixed dev secret so the prototype runs
      // with zero setup — and it must satisfy the 32-char floor too.
      expect(config.jwtSecret.length).toBeGreaterThanOrEqual(32);
      expect(config.sessionTtlMinutes).toBe(60);
      expect(config.cookieDomain).toBeUndefined();
    });

    it("uses HUB_JWT_SECRET when provided in mock mode", () => {
      const secret = "a-custom-mock-secret-that-is-long-enough!!";
      const config = resolveAuthConfig({ HUB_JWT_SECRET: secret });

      expect(config.mode).toBe("mock");
      expect(config.jwtSecret).toBe(secret);
    });
  });

  describe("google mode (fail-closed)", () => {
    it("throws when HUB_JWT_SECRET is missing", () => {
      expect(() => resolveAuthConfig({ AUTH_MODE: "google" })).toThrow();
    });

    it("throws when HUB_JWT_SECRET is shorter than 32 chars", () => {
      expect(() =>
        resolveAuthConfig({ AUTH_MODE: "google", HUB_JWT_SECRET: "too-short" }),
      ).toThrow();
    });

    it("resolves when HUB_JWT_SECRET is at least 32 chars", () => {
      const secret = "x".repeat(32);
      const config = resolveAuthConfig({
        AUTH_MODE: "google",
        HUB_JWT_SECRET: secret,
      });

      expect(config.mode).toBe("google");
      expect(config.jwtSecret).toBe(secret);
      // Google sub-config is present (validated later, in Phase 2).
      expect(config.google.hostedDomain).toBe("lerian.studio");
    });

    it("passes GOOGLE_* fields through to the google sub-config", () => {
      const config = resolveAuthConfig({
        AUTH_MODE: "google",
        HUB_JWT_SECRET: "x".repeat(40),
        GOOGLE_CLIENT_ID: "client-id-123",
        GOOGLE_CLIENT_SECRET: "client-secret-456",
        GOOGLE_REDIRECT_URI: "https://hub.lerian.studio/api/auth/callback",
      });

      expect(config.google.clientId).toBe("client-id-123");
      expect(config.google.clientSecret).toBe("client-secret-456");
      expect(config.google.redirectUri).toBe(
        "https://hub.lerian.studio/api/auth/callback",
      );
    });
  });

  describe("sessionTtlMinutes", () => {
    it("defaults to 60 when unset", () => {
      expect(resolveAuthConfig({}).sessionTtlMinutes).toBe(60);
    });

    it("parses a valid HUB_SESSION_TTL_MIN", () => {
      expect(
        resolveAuthConfig({ HUB_SESSION_TTL_MIN: "120" }).sessionTtlMinutes,
      ).toBe(120);
    });

    it("clamps to a minimum of 1 for zero or negative values", () => {
      expect(
        resolveAuthConfig({ HUB_SESSION_TTL_MIN: "0" }).sessionTtlMinutes,
      ).toBe(1);
      expect(
        resolveAuthConfig({ HUB_SESSION_TTL_MIN: "-5" }).sessionTtlMinutes,
      ).toBe(1);
    });

    it("falls back to 60 when HUB_SESSION_TTL_MIN is not a number", () => {
      expect(
        resolveAuthConfig({ HUB_SESSION_TTL_MIN: "not-a-number" })
          .sessionTtlMinutes,
      ).toBe(60);
    });
  });

  describe("cookieDomain", () => {
    it("is undefined when HUB_COOKIE_DOMAIN is unset (localhost-friendly)", () => {
      expect(resolveAuthConfig({}).cookieDomain).toBeUndefined();
    });

    it("passes HUB_COOKIE_DOMAIN through when set", () => {
      expect(
        resolveAuthConfig({ HUB_COOKIE_DOMAIN: ".lerian.studio" }).cookieDomain,
      ).toBe(".lerian.studio");
    });
  });
});

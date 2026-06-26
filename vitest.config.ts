import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Test harness for the Lerian Hub (Next.js 16 / React 19 / TS strict).
// Plain Vitest + jsdom — no Next.js-specific runner. Route handlers and
// middleware are verified via curl per the plan, not here.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      // Mirror the `@/*` -> `./*` alias from tsconfig.json.
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});

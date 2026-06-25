import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the on-screen dev/devtools route indicator (the floating "N" badge in
  // the bottom-left during `next dev`). Next 16 config: set `devIndicators` to
  // `false` to disable it entirely; compile/runtime errors are still surfaced.
  // See node_modules/next/dist/docs/.../next-config-js/devIndicators.md
  devIndicators: false,
};

export default nextConfig;

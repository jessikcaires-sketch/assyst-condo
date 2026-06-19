import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — the home dir has stray lockfiles that confuse inference.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

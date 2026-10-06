import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow an isolated production check while the development server stays running.
  distDir: process.env.ELARION_BUILD_DIR || '.next',
};

export default nextConfig;

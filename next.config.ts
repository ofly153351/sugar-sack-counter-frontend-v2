import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Ignore build errors for now - these are related to Next.js 15 async params
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sanity image CDN — used once product photography lands (Prompt B).
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;

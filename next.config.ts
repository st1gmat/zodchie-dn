import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow product image uploads through Server Actions (default cap is 1MB).
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;

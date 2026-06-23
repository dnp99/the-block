import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Dataset photos are placeholder URLs from placehold.co.
    remotePatterns: [{ protocol: "https", hostname: "placehold.co" }],
  },
};

export default nextConfig;

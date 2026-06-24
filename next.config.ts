import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js dev-tools indicator (the floating "N" in dev).
  devIndicators: false,
  images: {
    // Dataset photos are placeholder URLs from placehold.co, which serves SVG.
    // We render them unoptimized (see VehicleImage), so no optimizer involved.
    remotePatterns: [{ protocol: "https", hostname: "placehold.co" }],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);

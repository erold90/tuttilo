import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/:locale/pdf/from-jpg", destination: "/:locale/pdf/from-images", permanent: true },
      { source: "/:locale/pdf/to-jpg", destination: "/:locale/pdf/to-images", permanent: true },
      { source: "/:locale/pdf/to-png", destination: "/:locale/pdf/to-images", permanent: true },
      { source: "/:locale/pdf/to-word", destination: "/:locale/pdf/word", permanent: true },
      { source: "/:locale/pdf/from-word", destination: "/:locale/pdf/word", permanent: true },
      { source: "/:locale/pdf/merge", destination: "/:locale/pdf/organizer", permanent: true },
      { source: "/:locale/pdf/split", destination: "/:locale/pdf/organizer", permanent: true },
      { source: "/:locale/pdf/rotate", destination: "/:locale/pdf/organizer", permanent: true },
    ];
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

export default withNextIntl(nextConfig);

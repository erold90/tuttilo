import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
// pptxgenjs loaded via script tag — see pdf-to-pptx.tsx

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
      // Old PDF tool URLs → merged tools
      { source: "/:locale/pdf/fill-sign", destination: "/:locale/pdf/editor", permanent: true },
      { source: "/:locale/pdf/to-images", destination: "/:locale/pdf/images", permanent: true },
      { source: "/:locale/pdf/from-images", destination: "/:locale/pdf/images", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), payment=()" },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    if (!isServer) {
      // Fallbacks for any Node.js modules referenced by client libs
      config.resolve!.fallback = {
        ...config.resolve!.fallback,
        fs: false,
        stream: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);

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
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "yt3.ggpht.com",
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
    // CSP: permissive enough for Ezoic ads + GA4, but blocks major attack vectors
    const csp = [
      "default-src 'self'",
      // Scripts: self + known domains + unsafe-inline/eval needed for JSON-LD, GA4 init, ezstandalone, webpack chunks
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cmp.gatekeeperconsent.com https://the.gatekeeperconsent.com https://www.ezojs.com https://*.ezoic.net https://*.ezodn.com https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com https://pagead2.googlesyndication.com",
      // Styles: self + inline (Tailwind) + Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts: self + Google Fonts CDN
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + data/blob (tool outputs) + YouTube + Ezoic ads
      "img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com https://yt3.ggpht.com https://*.ezoic.net https://*.ezodn.com https://pagead2.googlesyndication.com",
      // Connections: self + analytics + ads + YouTube API + blob (workers)
      "connect-src 'self' blob: https://www.google-analytics.com https://www.googletagmanager.com https://*.ezoic.net https://*.ezojs.com https://*.ezodn.com https://cmp.gatekeeperconsent.com https://the.gatekeeperconsent.com https://youtube.googleapis.com https://pagead2.googlesyndication.com",
      // Media: self + blob (video/audio tool outputs)
      "media-src 'self' blob:",
      // Workers: self + blob (PDF.js web workers)
      "worker-src 'self' blob:",
      // Frames: self + Ezoic ad iframes
      "frame-src 'self' https://*.ezoic.net https://*.ezodn.com https://www.google.com https://pagead2.googlesyndication.com",
      // Block Flash/Java/plugins entirely
      "object-src 'none'",
      // Prevent base tag hijacking
      "base-uri 'self'",
      // Restrict form submissions
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: csp },
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

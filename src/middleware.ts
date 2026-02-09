import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), payment=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cmp.gatekeeperconsent.com https://the.gatekeeperconsent.com https://www.ezojs.com https://*.ezoic.net https://*.ezodn.com https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com https://pagead2.googlesyndication.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com https://yt3.ggpht.com https://*.ezoic.net https://*.ezodn.com https://pagead2.googlesyndication.com",
    "connect-src 'self' blob: https://www.google-analytics.com https://www.googletagmanager.com https://*.ezoic.net https://*.ezojs.com https://*.ezodn.com https://cmp.gatekeeperconsent.com https://the.gatekeeperconsent.com https://youtube.googleapis.com https://pagead2.googlesyndication.com",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "frame-src 'self' https://*.ezoic.net https://*.ezodn.com https://www.google.com https://pagead2.googlesyndication.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  // Match all paths except Next.js internals, API routes, and static files (with extension)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

"use client";

import Script from "next/script";

// Replace with your GA4 Measurement ID from https://analytics.google.com
// Or set NEXT_PUBLIC_GA_ID env var in Cloudflare Pages dashboard
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX";

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}

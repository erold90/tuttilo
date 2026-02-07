"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShieldWarning, ArrowsClockwise } from "@phosphor-icons/react";

// --- Detection probes (generic names to evade anti-anti-adblock filters) ---

function probeDOM(): Promise<boolean> {
  return new Promise((resolve) => {
    const el = document.createElement("div");
    el.innerHTML = "&nbsp;";
    el.className =
      "pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads banner-ads adsbox adSense";
    el.style.cssText =
      "position:absolute!important;left:-9999px!important;top:-9999px!important;width:1px!important;height:1px!important;pointer-events:none!important;";
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      setTimeout(() => {
        const gone =
          el.offsetHeight === 0 ||
          el.offsetParent === null ||
          el.clientHeight === 0 ||
          getComputedStyle(el).display === "none" ||
          getComputedStyle(el).visibility === "hidden";
        if (el.parentNode) el.parentNode.removeChild(el);
        resolve(gone);
      }, 150);
    });
  });
}

function probeNetwork(): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), 3000);
    fetch("/ads/ad-banner.js?_=" + Date.now(), {
      method: "HEAD",
      cache: "no-store",
    })
      .then((r) => {
        clearTimeout(timer);
        resolve(!r.ok);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(true);
      });
  });
}

function probeScript(): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), 3000);
    const s = document.createElement("script");
    // Cache-bust to prevent browser from reusing cached successful load
    s.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?_=" +
      Date.now();
    s.onerror = () => {
      clearTimeout(timer);
      resolve(true);
    };
    s.onload = () => {
      clearTimeout(timer);
      resolve(false);
    };
    document.head.appendChild(s);
    setTimeout(() => {
      try {
        s.remove();
      } catch {}
    }, 50);
  });
}

async function runProbes(): Promise<boolean> {
  const [dom, net, script] = await Promise.all([
    probeDOM(),
    probeNetwork(),
    probeScript(),
  ]);
  return dom || net || script;
}

export function SupportNotice({ children }: { children: React.ReactNode }) {
  const t = useTranslations("common.adblock");
  const pathname = usePathname();
  const [blocked, setBlocked] = useState(false);
  const [checking, setChecking] = useState(true);

  // Re-run detection on EVERY route change (pathname) so SPA navigation re-checks
  useEffect(() => {
    setBlocked(false);
    setChecking(true);

    const timer = setTimeout(async () => {
      const found = await runProbes();
      setBlocked(found);
      setChecking(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="relative">
      {/* Tool content — blurred and blocked when adblock detected */}
      <div
        className={
          blocked
            ? "pointer-events-none select-none blur-sm brightness-50 transition-all duration-500"
            : "transition-all duration-500"
        }
      >
        {children}
      </div>

      {/* Overlay wall */}
      {blocked && !checking && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-gray-950/95 via-amber-950/90 to-gray-950/95 p-8 shadow-2xl shadow-amber-500/10 backdrop-blur-md">
            {/* Glow effects */}
            <div className="pointer-events-none absolute -left-16 -top-16 h-32 w-32 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-orange-500/15 blur-3xl" />

            <div className="relative flex flex-col items-center text-center">
              {/* Icon */}
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
                <ShieldWarning className="h-9 w-9" weight="duotone" />
              </div>

              {/* Title */}
              <h3 className="mb-3 text-xl font-bold text-amber-200">
                {t("title")}
              </h3>

              {/* Message */}
              <p className="mb-4 text-sm leading-relaxed text-amber-100/80">
                {t("message")}
              </p>

              <p className="mb-6 text-sm leading-relaxed text-amber-100/60">
                {t("explain")}
              </p>

              {/* Reload button */}
              <button
                onClick={handleReload}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-gray-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-400/30 active:scale-95"
              >
                <ArrowsClockwise className="h-5 w-5" weight="bold" />
                {t("reload")}
              </button>

              {/* Footnote */}
              <p className="mt-4 text-xs text-amber-100/40">
                {t("footnote")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Heart, X } from "@phosphor-icons/react";

const DISMISS_KEY = "tuttilo_adb_dismiss";
const DISMISS_HOURS = 24;

function probeDOM(): Promise<boolean> {
  return new Promise((resolve) => {
    const el = document.createElement("div");
    el.innerHTML = "&nbsp;";
    el.className = "pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ads banner-ads adsbox";
    el.style.cssText = "position:absolute!important;left:-9999px!important;top:-9999px!important;width:1px!important;height:1px!important;pointer-events:none!important;";
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      setTimeout(() => {
        const gone = el.offsetHeight === 0 || el.offsetParent === null || el.clientHeight === 0 || getComputedStyle(el).display === "none" || getComputedStyle(el).visibility === "hidden";
        if (el.parentNode) el.parentNode.removeChild(el);
        resolve(gone);
      }, 150);
    });
  });
}

export function SupportNotice({ children }: { children: React.ReactNode }) {
  const t = useTranslations("common.adblock");
  const pathname = usePathname();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const ts = parseInt(dismissed, 10);
      if (Date.now() - ts < DISMISS_HOURS * 60 * 60 * 1000) return;
    }
    const timer = setTimeout(async () => {
      const found = await probeDOM();
      if (found) setShowBanner(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [pathname]);

  const dismiss = () => {
    setShowBanner(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  return (
    <>
      {children}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-lg animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-gray-950/95 p-4 shadow-lg backdrop-blur-md">
            <Heart className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" weight="duotone" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-amber-100/80 leading-relaxed">
                {t("message")}
              </p>
            </div>
            <button onClick={dismiss} className="flex-shrink-0 p-1 text-amber-100/40 hover:text-amber-100/80 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

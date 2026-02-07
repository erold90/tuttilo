"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function EzoicProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const ez = (window as any).ezstandalone;
    if (!ez?.cmd) return;

    // Wait for Ezoic CMP consent before showing ads
    // __cmp is the CMP API injected by gatekeeperconsent
    const cmp = (window as any).__cmp;
    if (cmp) {
      cmp("getConsentData", null, (data: any) => {
        if (data?.gdprApplies === false || data?.consentData) {
          ez.cmd.push(function () {
            ez.showAds();
          });
        }
      });
    } else {
      // No CMP loaded (non-EU or script blocked) — show ads
      ez.cmd.push(function () {
        ez.showAds();
      });
    }
  }, [pathname]);

  return null;
}

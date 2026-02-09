"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface EzStandalone {
  cmd?: Array<() => void>;
  showAds?: () => void;
}

interface CmpConsentData {
  gdprApplies?: boolean;
  consentData?: string;
}

declare global {
  interface Window {
    ezstandalone?: EzStandalone;
    __cmp?: (command: string, arg: null, callback: (data: CmpConsentData) => void) => void;
  }
}

export function EzoicProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const ez = window.ezstandalone;
    if (!ez?.cmd) return;

    // Wait for Ezoic CMP consent before showing ads
    // __cmp is the CMP API injected by gatekeeperconsent
    const cmp = window.__cmp;
    if (cmp) {
      cmp("getConsentData", null, (data) => {
        if (data?.gdprApplies === false || data?.consentData) {
          ez.cmd!.push(function () {
            ez.showAds?.();
          });
        }
      });
    } else {
      // No CMP loaded (non-EU or script blocked) — show ads
      ez.cmd.push(function () {
        ez.showAds?.();
      });
    }
  }, [pathname]);

  return null;
}

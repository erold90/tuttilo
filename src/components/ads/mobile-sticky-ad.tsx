"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X } from "@phosphor-icons/react";
import { AdSlot } from "@/components/ads/ad-slot";

const DISMISS_KEY = "tuttilo_mobile_ad_dismissed";
const DISMISS_DURATION = 30 * 60 * 1000; // 30 minutes

export function MobileStickyAd() {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION) {
        setIsDismissed(true);
        return;
      }
    }
    setIsDismissed(false);
  }, []);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }, []);

  if (isDismissed) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex items-center justify-center bg-background/80 p-2 backdrop-blur-sm",
        "border-t border-border",
        "lg:hidden"
      )}
    >
      <div className="relative">
        <AdSlot slot="mobile-sticky-320x50" width={320} height={50} />

        <button
          onClick={handleDismiss}
          className={cn(
            "absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full",
            "bg-muted text-muted-foreground shadow-sm",
            "transition-colors hover:bg-accent hover:text-accent-foreground"
          )}
          aria-label="Close advertisement"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function EzoicProvider() {
  const pathname = usePathname();

  // Call showAds on every route change (including initial mount)
  useEffect(() => {
    const ez = (window as any).ezstandalone;
    if (!ez?.cmd) return;

    // Push showAds to the command queue — sa.min.js processes it when ready
    ez.cmd.push(function () {
      ez.showAds();
    });
  }, [pathname]);

  return null;
}

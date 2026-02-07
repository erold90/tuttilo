"use client";

import { AdSlot } from "./ad-slot";

export function SidebarAd() {
  return (
    <div className="sticky top-20 hidden lg:block">
      <AdSlot slot={103} />
    </div>
  );
}

"use client";

import { AdSlot } from "@/components/ads/ad-slot";

export function SidebarAd() {
  return (
    <div className="sticky top-20 hidden lg:block">
      <AdSlot slot="sidebar-300x250" width={300} height={250} />
    </div>
  );
}

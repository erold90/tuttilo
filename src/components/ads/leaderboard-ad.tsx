"use client";

import { AdSlot } from "./ad-slot";

export function LeaderboardAd() {
  return (
    <div className="flex w-full justify-center">
      {/* Desktop: 728x90 */}
      <div className="hidden md:block">
        <AdSlot slot={101} />
      </div>
      {/* Mobile: 320x100 */}
      <div className="block md:hidden">
        <AdSlot slot={102} />
      </div>
    </div>
  );
}

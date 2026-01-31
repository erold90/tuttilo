"use client";

import { AdSlot } from "@/components/ads/ad-slot";

export function LeaderboardAd() {
  return (
    <div className="flex w-full justify-center">
      {/* Desktop: 728x90 */}
      <div className="hidden md:block">
        <AdSlot slot="leaderboard-728x90" width={728} height={90} />
      </div>
      {/* Mobile: 320x100 */}
      <div className="block md:hidden">
        <AdSlot slot="leaderboard-320x100" width={320} height={100} />
      </div>
    </div>
  );
}

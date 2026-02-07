"use client";

interface AdSlotProps {
  slot: number;
  className?: string;
}

export function AdSlot({ slot, className }: AdSlotProps) {
  return (
    <div
      id={`ezoic-pub-ad-placeholder-${slot}`}
      className={className}
    />
  );
}

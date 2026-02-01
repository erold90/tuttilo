"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  slot: string;
  width: number;
  height: number;
  className?: string;
}

export function AdSlot({ slot, width, height, className }: AdSlotProps) {
  // No ad network configured — hide empty placeholders
  return null;
}

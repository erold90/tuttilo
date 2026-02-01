"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "tuttilo:recents";
const MAX_RECENTS = 8;

interface RecentEntry {
  toolId: string;
  category: string;
  slug: string;
  timestamp: number;
}

function getRecents(): RecentEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecents(recents: RecentEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recents));
  } catch {
    // localStorage full or unavailable
  }
}

export function useRecents() {
  const [recents, setRecents] = useState<RecentEntry[]>([]);

  useEffect(() => {
    setRecents(getRecents());
  }, []);

  const addRecent = useCallback(
    (toolId: string, category: string, slug: string) => {
      setRecents((prev) => {
        const filtered = prev.filter((r) => r.toolId !== toolId);
        const next = [
          { toolId, category, slug, timestamp: Date.now() },
          ...filtered,
        ].slice(0, MAX_RECENTS);
        saveRecents(next);
        return next;
      });
    },
    []
  );

  return { recents, addRecent };
}

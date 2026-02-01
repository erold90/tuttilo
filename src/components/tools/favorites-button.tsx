"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/use-favorites";

interface FavoritesButtonProps {
  toolId: string;
  className?: string;
}

export function FavoritesButton({ toolId, className }: FavoritesButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(toolId);

  return (
    <button
      onClick={() => toggleFavorite(toolId)}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border p-2 transition-all hover:bg-muted",
        active && "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950",
        className
      )}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          "h-4.5 w-4.5 transition-colors",
          active
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground"
        )}
      />
    </button>
  );
}

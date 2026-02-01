"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

const RESOLUTIONS = [
  { key: "maxres", label: "HD (1280×720)", file: "maxresdefault.jpg" },
  { key: "sd", label: "SD (640×480)", file: "sddefault.jpg" },
  { key: "hq", label: "HQ (480×360)", file: "hqdefault.jpg" },
  { key: "mq", label: "MQ (320×180)", file: "mqdefault.jpg" },
] as const;

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.trim().match(p);
    if (m) return m[1];
  }
  return null;
}

export function YoutubeThumbnail() {
  const t = useTranslations("tools.youtube-thumbnail.ui");
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [available, setAvailable] = useState<Record<string, boolean>>({});

  const fetchThumbnails = useCallback(() => {
    const id = extractVideoId(url);
    if (!id) {
      setError(t("invalidUrl"));
      return;
    }
    setError("");
    setVideoId(id);
    setAvailable({});

    // Check which resolutions are available
    RESOLUTIONS.forEach((res) => {
      const img = new Image();
      img.onload = () => {
        // YouTube returns a 120x90 placeholder for unavailable resolutions
        if (img.naturalWidth > 120) {
          setAvailable((prev) => ({ ...prev, [res.key]: true }));
        }
      };
      img.onerror = () => {};
      img.src = `https://i.ytimg.com/vi/${id}/${res.file}`;
    });
  }, [url, t]);

  const download = useCallback(
    async (file: string, label: string) => {
      if (!videoId) return;
      const imgUrl = `https://i.ytimg.com/vi/${videoId}/${file}`;
      try {
        const res = await fetch(imgUrl);
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${videoId}_${label}.jpg`;
        a.click();
        URL.revokeObjectURL(a.href);
      } catch {
        // Fallback: open in new tab
        window.open(imgUrl, "_blank");
      }
    },
    [videoId]
  );

  const reset = useCallback(() => {
    setUrl("");
    setVideoId(null);
    setError("");
    setAvailable({});
  }, []);

  return (
    <div className="space-y-6">
      {!videoId ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("urlLabel")}
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              placeholder={t("urlPlaceholder")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && fetchThumbnails()}
            />
          </div>

          <button
            onClick={fetchThumbnails}
            disabled={!url.trim()}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {t("fetch")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground font-mono">{videoId}</p>
            <button
              onClick={reset}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("reset")}
            </button>
          </div>

          <div className="grid gap-4">
            {RESOLUTIONS.map((res) => (
              <div
                key={res.key}
                className="border rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-2 bg-muted/50">
                  <span className="text-sm font-medium">{res.label}</span>
                  {available[res.key] && (
                    <button
                      onClick={() => download(res.file, res.key)}
                      className="text-xs py-1 px-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90"
                    >
                      {t("download")}
                    </button>
                  )}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${videoId}/${res.file}`}
                  alt={`${res.label} thumbnail`}
                  className="w-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

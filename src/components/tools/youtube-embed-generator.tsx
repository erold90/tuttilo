"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

function extractVideoId(url: string): string | null {
  const m = url.trim().match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] || (url.trim().match(/^([a-zA-Z0-9_-]{11})$/))?.[1] || null;
}

export function YoutubeEmbedGenerator() {
  const t = useTranslations("tools.youtube-embed-generator.ui");
  const [url, setUrl] = useState("");
  const [autoplay, setAutoplay] = useState(false);
  const [loop, setLoop] = useState(false);
  const [muted, setMuted] = useState(false);
  const [controls, setControls] = useState(true);
  const [startTime, setStartTime] = useState(0);
  const [responsive, setResponsive] = useState(true);
  const [copied, setCopied] = useState(false);

  const videoId = useMemo(() => extractVideoId(url), [url]);

  const embedCode = useMemo(() => {
    if (!videoId) return "";
    const params: string[] = [];
    if (autoplay) params.push("autoplay=1");
    if (loop) params.push(`loop=1&playlist=${videoId}`);
    if (muted) params.push("mute=1");
    if (!controls) params.push("controls=0");
    if (startTime > 0) params.push(`start=${startTime}`);
    params.push("rel=0");
    const qs = params.length ? "?" + params.join("&") : "";
    const src = `https://www.youtube.com/embed/${videoId}${qs}`;
    if (responsive) {
      return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden"><iframe src="${src}" style="position:absolute;top:0;left:0;width:100%;height:100%" frameborder="0" allowfullscreen></iframe></div>`;
    }
    return `<iframe width="560" height="315" src="${src}" frameborder="0" allowfullscreen></iframe>`;
  }, [videoId, autoplay, loop, muted, controls, startTime, responsive]);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [embedCode]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">{t("urlLabel")}</label>
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t("urlPlaceholder")}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
        {[
          { label: t("autoplay"), checked: autoplay, set: setAutoplay },
          { label: t("loop"), checked: loop, set: setLoop },
          { label: t("muted"), checked: muted, set: setMuted },
          { label: t("controls"), checked: controls, set: setControls },
          { label: t("responsive"), checked: responsive, set: setResponsive },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={opt.checked} onChange={(e) => opt.set(e.target.checked)} className="rounded" />
            {opt.label}
          </label>
        ))}
        <div>
          <label className="block text-xs font-medium mb-1">{t("startTime")} (s)</label>
          <input type="number" min={0} value={startTime} onChange={(e) => setStartTime(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-border bg-background px-2 py-1 text-sm" />
        </div>
      </div>

      {videoId && (
        <>
          <div className="rounded-lg overflow-hidden border border-border">
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe src={`https://www.youtube.com/embed/${videoId}?rel=0`} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} allowFullScreen />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium">{t("code")}</label>
              <button onClick={copy} className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90">
                {copied ? t("copied") : t("copy")}
              </button>
            </div>
            <pre className="rounded-lg border border-border bg-muted/50 p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all">{embedCode}</pre>
          </div>
        </>
      )}
    </div>
  );
}

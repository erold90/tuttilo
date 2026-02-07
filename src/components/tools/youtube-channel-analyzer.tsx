"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

function extractChannelInfo(url: string): { type: "id" | "handle"; value: string } | null {
  const idMatch = url.match(/(?:channel\/)?(UC[\w-]{22})/);
  if (idMatch) return { type: "id", value: idMatch[1] };
  const handleMatch = url.match(/@([\w.-]+)/);
  if (handleMatch) return { type: "handle", value: handleMatch[1] };
  const clean = url.replace(/^https?:\/\/(www\.)?youtube\.com\/?/, "").replace(/\/$/, "").trim();
  if (clean && !clean.includes("/")) return { type: "handle", value: clean };
  return null;
}

function fmtNum(n: number): string { return n.toLocaleString(); }
function fmtPct(n: number): string { return n < 0.01 ? "<0.01%" : n.toFixed(2) + "%"; }
function fmtMoney(n: number): string { return "$" + n.toLocaleString(); }

function calcAge(dateStr: string): string {
  const created = new Date(dateStr);
  const now = new Date();
  let years = now.getFullYear() - created.getFullYear();
  let months = now.getMonth() - created.getMonth();
  if (months < 0) { years--; months += 12; }
  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}m`);
  if (parts.length === 0) parts.push("<1m");
  return parts.join(" ");
}

function monthsSince(dateStr: string): number {
  const created = new Date(dateStr);
  const now = new Date();
  return Math.max(1, (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth()));
}

function calcGrade(subs: number, viewsPerSub: number, uploadsPerMonth: number): { grade: string; color: string } {
  let score = 0;
  // Subscribers score (0-40)
  if (subs >= 10_000_000) score += 40;
  else if (subs >= 1_000_000) score += 35;
  else if (subs >= 100_000) score += 28;
  else if (subs >= 10_000) score += 20;
  else if (subs >= 1_000) score += 12;
  else score += 5;
  // Views per subscriber (0-30)
  if (viewsPerSub >= 100) score += 30;
  else if (viewsPerSub >= 50) score += 25;
  else if (viewsPerSub >= 20) score += 18;
  else if (viewsPerSub >= 10) score += 12;
  else score += 5;
  // Upload frequency (0-30)
  if (uploadsPerMonth >= 8) score += 30;
  else if (uploadsPerMonth >= 4) score += 25;
  else if (uploadsPerMonth >= 2) score += 18;
  else if (uploadsPerMonth >= 0.5) score += 10;
  else score += 3;

  if (score >= 90) return { grade: "A+", color: "text-green-500" };
  if (score >= 80) return { grade: "A", color: "text-green-500" };
  if (score >= 70) return { grade: "B+", color: "text-green-400" };
  if (score >= 60) return { grade: "B", color: "text-blue-500" };
  if (score >= 50) return { grade: "C+", color: "text-yellow-500" };
  if (score >= 40) return { grade: "C", color: "text-yellow-500" };
  if (score >= 30) return { grade: "D+", color: "text-orange-500" };
  if (score >= 20) return { grade: "D", color: "text-orange-500" };
  return { grade: "F", color: "text-red-500" };
}

interface ChannelData {
  title: string; description: string; customUrl: string; publishedAt: string;
  thumbnail: string; subscriberCount: number; viewCount: number; videoCount: number;
  country: string;
}

export function YoutubeChannelAnalyzer() {
  const t = useTranslations("tools.youtube-channel-analyzer.ui");
  const [url, setUrl] = useState("");
  const [data, setData] = useState<ChannelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = useCallback(async () => {
    const info = extractChannelInfo(url);
    if (!info) { setError(t("invalidUrl")); return; }
    setError(""); setLoading(true); setData(null);
    try {
      const type = info.type === "id" ? "channel" : "handle";
      const res = await fetch(`/api/youtube?type=${type}&id=${encodeURIComponent(info.value)}`);
      const json = await res.json();
      if (json.error) {
        const errMsg = typeof json.error === "string" ? json.error : json.error?.message || t("fetchError");
        setError(errMsg === "not_configured" ? t("apiNotConfigured") : errMsg);
        setLoading(false); return;
      }
      const item = json.items?.[0];
      if (!item) { setError(t("notFound")); setLoading(false); return; }
      setData({
        title: item.snippet.title,
        description: item.snippet.description,
        customUrl: item.snippet.customUrl || "",
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "",
        subscriberCount: Number(item.statistics.subscriberCount || 0),
        viewCount: Number(item.statistics.viewCount || 0),
        videoCount: Number(item.statistics.videoCount || 0),
        country: item.snippet.country || "—",
      });
    } catch { setError(t("fetchError")); }
    setLoading(false);
  }, [url, t]);

  const metrics = useMemo(() => {
    if (!data) return null;
    const months = monthsSince(data.publishedAt);
    const uploadsPerMonth = data.videoCount / months;
    const viewsPerSub = data.subscriberCount > 0 ? data.viewCount / data.subscriberCount : 0;
    const subsPerVideo = data.videoCount > 0 ? Math.round(data.subscriberCount / data.videoCount) : 0;
    const avgViews = data.videoCount > 0 ? Math.round(data.viewCount / data.videoCount) : 0;
    const monthlyViews = Math.round(data.viewCount / months);
    const earningsLow = Math.round((monthlyViews / 1000) * 1);
    const earningsHigh = Math.round((monthlyViews / 1000) * 5);
    const yearlyLow = earningsLow * 12;
    const yearlyHigh = earningsHigh * 12;
    const grade = calcGrade(data.subscriberCount, viewsPerSub, uploadsPerMonth);
    return { uploadsPerMonth, viewsPerSub, subsPerVideo, avgViews, monthlyViews, earningsLow, earningsHigh, yearlyLow, yearlyHigh, grade, months };
  }, [data]);

  const reset = useCallback(() => { setUrl(""); setData(null); setError(""); }, []);

  return (
    <div className="space-y-6">
      {!data ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("urlLabel")}</label>
            <input type="text" value={url} onChange={(e) => { setUrl(e.target.value); setError(""); }}
              placeholder={t("urlPlaceholder")} onKeyDown={(e) => e.key === "Enter" && analyze()}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <button onClick={analyze} disabled={!url.trim() || loading}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50">
            {loading ? t("loading") : t("analyze")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header with Grade */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {data.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.thumbnail} alt={data.title} className="w-16 h-16 rounded-full" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{data.title}</h3>
                  {metrics && (
                    <span className={`text-2xl font-bold ${metrics.grade.color}`}>{metrics.grade.grade}</span>
                  )}
                </div>
                {data.customUrl && <p className="text-sm text-muted-foreground">{data.customUrl}</p>}
              </div>
            </div>
            <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground">{t("reset")}</button>
          </div>

          {/* Primary Stats */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {[
              { label: t("subscribers"), value: fmtNum(data.subscriberCount) },
              { label: t("totalViews"), value: fmtNum(data.viewCount) },
              { label: t("totalVideos"), value: fmtNum(data.videoCount) },
              { label: t("channelAge"), value: calcAge(data.publishedAt) },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Performance Metrics */}
          {metrics && (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">{t("avgViews")}</p>
                <p className="text-lg font-bold">{fmtNum(metrics.avgViews)}</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">{t("viewsPerSub")}</p>
                <p className="text-lg font-bold">{metrics.viewsPerSub.toFixed(1)}</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">{t("subsPerVideo")}</p>
                <p className="text-lg font-bold">{fmtNum(metrics.subsPerVideo)}</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">{t("uploadFreq")}</p>
                <p className="text-lg font-bold">{metrics.uploadsPerMonth.toFixed(1)}/mo</p>
              </div>
            </div>
          )}

          {/* Earnings Estimate */}
          {metrics && (
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-medium mb-3">{t("estEarnings")}</p>
              <div className="grid gap-3 grid-cols-2">
                <div className="rounded-lg bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">{t("monthly")}</p>
                  <p className="text-lg font-bold">{fmtMoney(metrics.earningsLow)} – {fmtMoney(metrics.earningsHigh)}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">{t("yearly")}</p>
                  <p className="text-lg font-bold">{fmtMoney(metrics.yearlyLow)} – {fmtMoney(metrics.yearlyHigh)}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{t("earningsNote")}</p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("created")}</p>
              <p className="font-medium">{new Date(data.publishedAt).toLocaleDateString()}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("country")}</p>
              <p className="font-medium">{data.country}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("monthlyViews")}</p>
              <p className="font-medium">{metrics ? fmtNum(metrics.monthlyViews) : "—"}</p>
            </div>
          </div>

          {/* Description */}
          {data.description && (
            <div>
              <p className="text-sm font-medium mb-1">{t("description")}</p>
              <pre className="rounded-lg border border-border bg-muted/30 p-3 text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">{data.description}</pre>
            </div>
          )}
        </div>
      )}

      {error && <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>}
    </div>
  );
}

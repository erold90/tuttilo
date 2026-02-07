"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

function extractVideoId(url: string): string | null {
  const m = url.trim().match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] || (url.trim().match(/^([a-zA-Z0-9_-]{11})$/))?.[1] || null;
}

function fmtNum(n: number): string { return n.toLocaleString(); }
function fmtPct(n: number): string { return n < 0.01 ? "<0.01%" : n.toFixed(2) + "%"; }

function parseDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return iso;
  const h = m[1] ? `${m[1]}h ` : "";
  const min = m[2] ? `${m[2]}m ` : "";
  const s = m[3] ? `${m[3]}s` : "";
  return (h + min + s).trim() || "0s";
}

function daysSince(dateStr: string): number {
  return Math.max(1, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000));
}

const CATEGORIES: Record<string, string> = {
  "1": "Film & Animation", "2": "Autos & Vehicles", "10": "Music",
  "15": "Pets & Animals", "17": "Sports", "18": "Short Movies",
  "19": "Travel & Events", "20": "Gaming", "21": "Videoblogging",
  "22": "People & Blogs", "23": "Comedy", "24": "Entertainment",
  "25": "News & Politics", "26": "Howto & Style", "27": "Education",
  "28": "Science & Technology", "29": "Nonprofits & Activism",
  "30": "Movies", "31": "Anime/Animation", "32": "Action/Adventure",
  "33": "Classics", "34": "Comedy", "35": "Documentary", "36": "Drama",
  "37": "Family", "38": "Foreign", "39": "Horror", "40": "Sci-Fi/Fantasy",
  "41": "Thriller", "42": "Shorts", "43": "Shows", "44": "Trailers",
};

function calcSeoScore(title: string, desc: string, tags: string[]): { score: number; tips: string[] } {
  let score = 0;
  const tips: string[] = [];
  // Title: 40-60 chars ideal
  if (title.length >= 30 && title.length <= 70) score += 25;
  else if (title.length > 0) { score += 10; tips.push("title_length"); }
  // Description: 200+ chars
  if (desc.length >= 200) score += 25;
  else if (desc.length >= 50) { score += 15; tips.push("desc_short"); }
  else { score += 5; tips.push("desc_missing"); }
  // Tags: 5+ tags
  if (tags.length >= 10) score += 25;
  else if (tags.length >= 5) { score += 15; tips.push("more_tags"); }
  else if (tags.length > 0) { score += 5; tips.push("few_tags"); }
  else tips.push("no_tags");
  // Description has links
  if (desc.match(/https?:\/\//)) score += 10;
  else tips.push("add_links");
  // Description has hashtags
  if (desc.match(/#\w+/)) score += 5;
  else tips.push("add_hashtags");
  // Title has numbers or year
  if (title.match(/\d/)) score += 5;
  // Title has power words
  if (title.match(/how|why|best|top|ultimate|guide|tutorial|free|new|secret/i)) score += 5;
  return { score: Math.min(100, score), tips };
}

function seoColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
}

function seoLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Poor";
}

interface VideoData {
  title: string; channelTitle: string; publishedAt: string; description: string;
  tags: string[]; viewCount: number; likeCount: number; commentCount: number;
  duration: string; thumbnail: string; categoryId: string;
  definition: string; caption: string;
}

export function YoutubeVideoAnalyzer() {
  const t = useTranslations("tools.youtube-video-analyzer.ui");
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [data, setData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedTags, setCopiedTags] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const analyze = useCallback(async () => {
    const id = extractVideoId(url);
    if (!id) { setError(t("invalidUrl")); return; }
    setError(""); setLoading(true); setData(null);
    try {
      const res = await fetch(`/api/youtube?type=video&id=${id}`);
      const json = await res.json();
      if (json.error) {
        const errMsg = typeof json.error === "string" ? json.error : json.error?.message || t("fetchError");
        setError(errMsg === "not_configured" ? t("apiNotConfigured") : errMsg);
        setLoading(false); return;
      }
      const item = json.items?.[0];
      if (!item) { setError(t("notFound")); setLoading(false); return; }
      setVideoId(id);
      setData({
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        description: item.snippet.description,
        tags: item.snippet.tags || [],
        viewCount: Number(item.statistics.viewCount),
        likeCount: Number(item.statistics.likeCount || 0),
        commentCount: Number(item.statistics.commentCount || 0),
        duration: item.contentDetails.duration,
        thumbnail: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || "",
        categoryId: item.snippet.categoryId,
        definition: item.contentDetails?.definition || "",
        caption: item.contentDetails?.caption || "false",
      });
    } catch { setError(t("fetchError")); }
    setLoading(false);
  }, [url, t]);

  const metrics = useMemo(() => {
    if (!data) return null;
    const days = daysSince(data.publishedAt);
    const engagementRate = data.viewCount > 0 ? ((data.likeCount + data.commentCount) / data.viewCount) * 100 : 0;
    const likeRate = data.viewCount > 0 ? (data.likeCount / data.viewCount) * 100 : 0;
    const viewsPerDay = Math.round(data.viewCount / days);
    const earningsLow = Math.round((data.viewCount / 1000) * 1);
    const earningsHigh = Math.round((data.viewCount / 1000) * 5);
    const seo = calcSeoScore(data.title, data.description, data.tags);
    const category = CATEGORIES[data.categoryId] || data.categoryId;
    return { engagementRate, likeRate, viewsPerDay, earningsLow, earningsHigh, seo, category, days };
  }, [data]);

  const copyTags = useCallback(() => {
    if (!data?.tags.length) return;
    navigator.clipboard.writeText(data.tags.join(", "));
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2000);
  }, [data]);

  const copyEmbed = useCallback(() => {
    if (!videoId) return;
    const code = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(code);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  }, [videoId]);

  const downloadThumbnail = useCallback(async () => {
    if (!videoId) return;
    try {
      const res = await fetch(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `thumbnail-${videoId}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, "_blank");
    }
  }, [videoId]);

  const reset = useCallback(() => { setUrl(""); setData(null); setError(""); setVideoId(""); }, []);

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
          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">{data.title}</h3>
            <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground shrink-0 ml-4">{t("reset")}</button>
          </div>

          {/* Thumbnail + Actions */}
          {data.thumbnail && (
            <div className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.thumbnail} alt={data.title} className="w-full rounded-lg" />
              <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={downloadThumbnail}
                  className="px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs font-medium hover:bg-black/90 backdrop-blur-sm">
                  {t("downloadThumb")}
                </button>
                <button onClick={copyEmbed}
                  className="px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs font-medium hover:bg-black/90 backdrop-blur-sm">
                  {copiedEmbed ? t("copied") : t("copyEmbed")}
                </button>
              </div>
            </div>
          )}

          {/* Primary Stats */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {[
              { label: t("views"), value: fmtNum(data.viewCount) },
              { label: t("likes"), value: fmtNum(data.likeCount) },
              { label: t("comments"), value: fmtNum(data.commentCount) },
              { label: t("duration"), value: parseDuration(data.duration) },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Engagement Metrics */}
          {metrics && (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">{t("engagementRate")}</p>
                <p className="text-lg font-bold">{fmtPct(metrics.engagementRate)}</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">{t("likeRate")}</p>
                <p className="text-lg font-bold">{fmtPct(metrics.likeRate)}</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">{t("viewsPerDay")}</p>
                <p className="text-lg font-bold">{fmtNum(metrics.viewsPerDay)}</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">{t("estEarnings")}</p>
                <p className="text-lg font-bold">${fmtNum(metrics.earningsLow)}–${fmtNum(metrics.earningsHigh)}</p>
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("channel")}</p>
              <p className="font-medium truncate">{data.channelTitle}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("published")}</p>
              <p className="font-medium">{new Date(data.publishedAt).toLocaleDateString()}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("category")}</p>
              <p className="font-medium truncate">{metrics?.category || "—"}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("quality")}</p>
              <p className="font-medium">
                {data.definition === "hd" ? "HD" : data.definition === "sd" ? "SD" : "—"}
                {data.caption === "true" && <span className="ml-1 text-xs text-muted-foreground">CC</span>}
              </p>
            </div>
          </div>

          {/* SEO Score */}
          {metrics && (
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{t("seoScore")}</p>
                <span className={`text-2xl font-bold ${seoColor(metrics.seo.score)}`}>
                  {metrics.seo.score}/100
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full mb-2">
                <div className={`h-2 rounded-full transition-all ${metrics.seo.score >= 80 ? "bg-green-500" : metrics.seo.score >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${metrics.seo.score}%` }} />
              </div>
              <p className={`text-sm font-medium ${seoColor(metrics.seo.score)}`}>{seoLabel(metrics.seo.score)}</p>
              {metrics.seo.tips.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {metrics.seo.tips.map((tip) => (
                    <li key={tip} className="text-xs text-muted-foreground">• {t(`seoTip_${tip}`)}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Tags */}
          {data.tags.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">{t("tags")} ({data.tags.length})</p>
                <button onClick={copyTags} className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90">
                  {copiedTags ? t("copied") : t("copyTags")}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-xs">{tag}</span>
                ))}
              </div>
            </div>
          )}

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

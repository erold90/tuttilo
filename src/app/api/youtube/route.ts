export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

const KEY = process.env.YOUTUBE_API_KEY || "";
const API = "https://www.googleapis.com/youtube/v3";

// --- Rate limiter (in-memory, per edge instance) ---
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQ = 30; // 30 requests/min per IP
const rLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const ts = (rLog.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (ts.length >= MAX_REQ) {
    rLog.set(ip, ts);
    return true;
  }
  ts.push(now);
  rLog.set(ip, ts);
  // Evict stale entries
  if (rLog.size > 5000) {
    for (const [k, v] of rLog) {
      if (v.filter((t) => now - t < WINDOW_MS).length === 0) rLog.delete(k);
    }
  }
  return false;
}

// --- Input validation ---
const VALID_TYPES = new Set(["video", "channel", "handle"]);
const ID_RE = /^[a-zA-Z0-9_@.\-]{1,100}$/;

export async function GET(req: NextRequest) {
  if (!KEY) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  // Rate limit by IP
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": "60" } });
  }

  const p = new URL(req.url).searchParams;
  const type = p.get("type");
  const id = p.get("id");
  if (!type || !id) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  // Validate type and id format
  if (!VALID_TYPES.has(type)) return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  if (!ID_RE.test(id)) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const urls: Record<string, string> = {
    video: `${API}/videos?part=snippet,statistics,contentDetails&id=${encodeURIComponent(id)}&key=${KEY}`,
    channel: `${API}/channels?part=snippet,statistics&id=${encodeURIComponent(id)}&key=${KEY}`,
    handle: `${API}/channels?part=snippet,statistics&forHandle=${encodeURIComponent(id)}&key=${KEY}`,
  };

  const url = urls[type]!;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      headers: { Referer: "https://tuttilo.com/" },
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    // Detect YouTube quota exhaustion
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      if (res.status === 403 && errBody.includes("quotaExceeded")) {
        return NextResponse.json({ error: "quota_exceeded" }, { status: 429, headers: { "Retry-After": "3600", "Cache-Control": "public, max-age=300" } });
      }
      return NextResponse.json({ error: "upstream_error", status: res.status }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600" },
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return NextResponse.json({ error: "timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}

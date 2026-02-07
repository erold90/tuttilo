export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

const KEY = process.env.YOUTUBE_API_KEY || "";
const API = "https://www.googleapis.com/youtube/v3";

export async function GET(req: NextRequest) {
  if (!KEY) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const p = new URL(req.url).searchParams;
  const type = p.get("type");
  const id = p.get("id");
  if (!type || !id) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const urls: Record<string, string> = {
    video: `${API}/videos?part=snippet,statistics,contentDetails&id=${encodeURIComponent(id)}&key=${KEY}`,
    channel: `${API}/channels?part=snippet,statistics&id=${encodeURIComponent(id)}&key=${KEY}`,
    handle: `${API}/channels?part=snippet,statistics&forHandle=${encodeURIComponent(id)}&key=${KEY}`,
  };

  const url = urls[type];
  if (!url) return NextResponse.json({ error: "invalid_type" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { Referer: "https://tuttilo.com/" },
    });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}

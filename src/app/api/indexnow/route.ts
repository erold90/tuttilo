export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { tools, categories } from "@/lib/tools/registry";
import { locales } from "@/i18n/routing";

const INDEXNOW_KEY = "a1fd1ae7e759405497c1deaf450ae405";
const BASE_URL = "https://tuttilo.com";

function getAllUrls(): string[] {
  const urls: string[] = [];

  // Homepage for each locale
  for (const locale of locales) {
    urls.push(`${BASE_URL}/${locale}`);
  }

  // Category pages
  for (const category of categories) {
    for (const locale of locales) {
      urls.push(`${BASE_URL}/${locale}/${category.slug}`);
    }
  }

  // Tool pages
  for (const tool of tools) {
    const category = categories.find((c) => c.id === tool.category);
    if (!category || !tool.isAvailable) continue;
    for (const locale of locales) {
      urls.push(`${BASE_URL}/${locale}/${category.slug}/${tool.slug}`);
    }
  }

  return urls;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("x-indexnow-auth");
  if (authHeader !== INDEXNOW_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const urls = getAllUrls();

  // Submit to IndexNow (Bing, Yandex, etc.)
  const payload = {
    host: "tuttilo.com",
    key: INDEXNOW_KEY,
    keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  const results: Record<string, number> = {};

  // IndexNow endpoints
  const engines = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
    "https://yandex.com/indexnow",
  ];

  for (const engine of engines) {
    try {
      const res = await fetch(engine, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      results[engine] = res.status;
    } catch {
      results[engine] = 0;
    }
  }

  return NextResponse.json({
    submitted: urls.length,
    results,
  });
}

export async function GET() {
  return NextResponse.json({
    key: INDEXNOW_KEY,
    totalUrls: getAllUrls().length,
    info: "POST to this endpoint with x-indexnow-auth header to submit URLs",
  });
}

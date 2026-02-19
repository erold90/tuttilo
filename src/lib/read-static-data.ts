const ORIGIN = "https://tuttilo.com";
const FALLBACK_REVALIDATE_SECONDS = 3600;

function normalizeOrigin(value: string | undefined): string | null {
  if (!value) return null;
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

/**
 * Read a JSON file from /data/ with edge-safe fetch only.
 */
async function readStaticJson<T = Record<string, unknown>>(
  relativePath: string
): Promise<T | null> {
  const preferredOrigin =
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeOrigin(process.env.SITE_URL);
  const origins = preferredOrigin && preferredOrigin !== ORIGIN
    ? [preferredOrigin, ORIGIN]
    : [ORIGIN];

  for (const origin of origins) {
    try {
      const res = await fetch(`${origin}/data/${relativePath}`, {
        next: { revalidate: FALLBACK_REVALIDATE_SECONDS },
      });
      if (res.ok) return (await res.json()) as T;
    } catch {
      // try next origin
    }
  }

  return null;
}

/**
 * Read with automatic fallback to EN locale.
 */
export async function readStaticJsonWithFallback<T = Record<string, unknown>>(
  subdir: string,
  locale: string,
  filename: string
): Promise<T | null> {
  const data = await readStaticJson<T>(`${subdir}/${locale}/${filename}`);
  if (data) return data;
  if (locale !== "en") {
    return readStaticJson<T>(`${subdir}/en/${filename}`);
  }
  return null;
}

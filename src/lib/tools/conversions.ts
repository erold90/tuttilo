// ============================================================================
// Programmatic SEO — Conversion Landing Pages
// Structural data only — all translatable strings are in messages/{locale}.json
// under the "conversions" namespace
// ============================================================================

export interface Conversion {
  slug: string;          // URL: /convert/{slug}
  toolId: string;        // Maps to actual tool
  category: string;      // Tool category slug
  toolSlug: string;      // Tool slug within category
}

export const conversions: Conversion[] = [
  // PDF Conversions
  { slug: "pdf-to-word", toolId: "pdf-word", category: "pdf", toolSlug: "word" },
  { slug: "word-to-pdf", toolId: "pdf-word", category: "pdf", toolSlug: "word" },
  { slug: "pdf-to-excel", toolId: "pdf-excel", category: "pdf", toolSlug: "excel" },
  { slug: "pdf-to-powerpoint", toolId: "pdf-pptx", category: "pdf", toolSlug: "powerpoint" },
  { slug: "images-to-pdf", toolId: "pdf-images", category: "pdf", toolSlug: "images" },
  { slug: "html-to-pdf", toolId: "html-to-pdf", category: "pdf", toolSlug: "from-html" },
  { slug: "compress-pdf", toolId: "compress-pdf", category: "pdf", toolSlug: "compress" },
  { slug: "pdf-to-text", toolId: "pdf-to-text", category: "pdf", toolSlug: "to-text" },
  // Image Conversions
  { slug: "png-to-jpg", toolId: "image-converter", category: "image", toolSlug: "converter" },
  { slug: "jpg-to-png", toolId: "image-converter", category: "image", toolSlug: "converter" },
  { slug: "webp-to-jpg", toolId: "image-converter", category: "image", toolSlug: "converter" },
  { slug: "webp-to-png", toolId: "image-converter", category: "image", toolSlug: "converter" },
  { slug: "heic-to-jpg", toolId: "image-converter", category: "image", toolSlug: "converter" },
  { slug: "svg-to-png", toolId: "image-converter", category: "image", toolSlug: "converter" },
  { slug: "jpg-to-webp", toolId: "image-converter", category: "image", toolSlug: "converter" },
  { slug: "png-to-webp", toolId: "image-converter", category: "image", toolSlug: "converter" },
  { slug: "compress-image", toolId: "image-compressor", category: "image", toolSlug: "compressor" },
  // Video Conversions
  { slug: "video-to-gif", toolId: "video-to-gif", category: "video", toolSlug: "to-gif" },
  { slug: "video-to-mp3", toolId: "video-to-mp3", category: "video", toolSlug: "to-mp3" },
];

// Helper: get all conversion slugs for sitemap
export function getConversionSlugs(): string[] {
  return conversions.map((c) => c.slug);
}

// Helper: find conversion by slug
export function getConversion(slug: string): Conversion | undefined {
  return conversions.find((c) => c.slug === slug);
}

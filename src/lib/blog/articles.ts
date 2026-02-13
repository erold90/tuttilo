/** Blog article registry — all articles with metadata */

export interface BlogArticle {
  slug: string;
  /** Translation key under blog.articles.{slug} */
  category: "how-to" | "guide" | "best-practices" | "informational";
  /** Related tool IDs for internal linking */
  relatedTools: string[];
  /** Author key */
  author: "daniele";
  /** Publication date */
  date: string;
  /** Reading time in minutes */
  readingTime: number;
  /** Cover image path (optional) */
  image?: string;
}

export const blogArticles: BlogArticle[] = [
  // How-to (8)
  {
    slug: "how-to-compress-pdf",
    category: "how-to",
    relatedTools: ["compress-pdf", "pdf-editor", "merge-pdf"],
    author: "daniele",
    date: "2026-02-10",
    readingTime: 6,
  },
  {
    slug: "how-to-convert-images",
    category: "how-to",
    relatedTools: ["image-converter", "compress-image", "resize-image"],
    author: "daniele",
    date: "2026-02-10",
    readingTime: 7,
  },
  {
    slug: "how-to-edit-pdf",
    category: "how-to",
    relatedTools: ["pdf-editor", "pdf-fill-form", "pdf-annotate"],
    author: "daniele",
    date: "2026-02-09",
    readingTime: 8,
  },
  {
    slug: "how-to-remove-background",
    category: "how-to",
    relatedTools: ["remove-background", "crop-image", "resize-image"],
    author: "daniele",
    date: "2026-02-09",
    readingTime: 5,
  },
  {
    slug: "how-to-create-qr-code",
    category: "how-to",
    relatedTools: ["qr-code", "barcode"],
    author: "daniele",
    date: "2026-02-08",
    readingTime: 5,
  },
  {
    slug: "how-to-convert-video",
    category: "how-to",
    relatedTools: ["video-converter", "compress-video", "video-to-gif"],
    author: "daniele",
    date: "2026-02-08",
    readingTime: 6,
  },
  {
    slug: "how-to-merge-pdf",
    category: "how-to",
    relatedTools: ["merge-pdf", "split-pdf", "compress-pdf"],
    author: "daniele",
    date: "2026-02-07",
    readingTime: 5,
  },
  {
    slug: "how-to-resize-images",
    category: "how-to",
    relatedTools: ["resize-image", "compress-image", "crop-image"],
    author: "daniele",
    date: "2026-02-07",
    readingTime: 6,
  },
  // Guides (6)
  {
    slug: "jpeg-vs-png-vs-webp",
    category: "guide",
    relatedTools: ["image-converter", "compress-image"],
    author: "daniele",
    date: "2026-02-06",
    readingTime: 8,
  },
  {
    slug: "pdf-vs-word",
    category: "guide",
    relatedTools: ["pdf-to-word", "word-to-pdf"],
    author: "daniele",
    date: "2026-02-06",
    readingTime: 7,
  },
  {
    slug: "md5-vs-sha256",
    category: "guide",
    relatedTools: ["md5-hash", "sha256-hash", "file-hash-checker"],
    author: "daniele",
    date: "2026-02-05",
    readingTime: 8,
  },
  {
    slug: "rgb-vs-hex-vs-hsl",
    category: "guide",
    relatedTools: ["hex-rgb-converter", "color-picker", "contrast-checker"],
    author: "daniele",
    date: "2026-02-05",
    readingTime: 7,
  },
  {
    slug: "json-vs-xml-vs-yaml",
    category: "guide",
    relatedTools: ["json-formatter", "xml-json-converter", "yaml-json-converter"],
    author: "daniele",
    date: "2026-02-04",
    readingTime: 9,
  },
  {
    slug: "base64-encoding-guide",
    category: "guide",
    relatedTools: ["base64-encode", "base64-image"],
    author: "daniele",
    date: "2026-02-04",
    readingTime: 7,
  },
  // Best Practices (4)
  {
    slug: "image-optimization-web",
    category: "best-practices",
    relatedTools: ["compress-image", "resize-image", "image-converter"],
    author: "daniele",
    date: "2026-02-03",
    readingTime: 9,
  },
  {
    slug: "file-security-privacy",
    category: "best-practices",
    relatedTools: ["aes-encrypt", "file-hash-checker", "password-generator"],
    author: "daniele",
    date: "2026-02-03",
    readingTime: 8,
  },
  {
    slug: "css-tools-designers",
    category: "best-practices",
    relatedTools: ["gradient-generator", "box-shadow-generator", "flexbox-generator"],
    author: "daniele",
    date: "2026-02-02",
    readingTime: 7,
  },
  {
    slug: "seo-tools-guide",
    category: "best-practices",
    relatedTools: ["meta-tag-generator", "open-graph-preview", "sitemap-generator"],
    author: "daniele",
    date: "2026-02-02",
    readingTime: 8,
  },
  // Informational (4)
  {
    slug: "what-is-color-theory",
    category: "informational",
    relatedTools: ["color-picker", "palette-generator", "contrast-checker"],
    author: "daniele",
    date: "2026-02-01",
    readingTime: 10,
  },
  {
    slug: "understanding-video-formats",
    category: "informational",
    relatedTools: ["video-converter", "compress-video", "video-to-gif"],
    author: "daniele",
    date: "2026-02-01",
    readingTime: 8,
  },
  {
    slug: "calculator-tools-guide",
    category: "informational",
    relatedTools: ["scientific-calculator", "percentage-calculator", "bmi-calculator"],
    author: "daniele",
    date: "2026-01-31",
    readingTime: 7,
  },
  {
    slug: "privacy-browser-tools",
    category: "informational",
    relatedTools: ["aes-encrypt", "password-generator", "file-hash-checker"],
    author: "daniele",
    date: "2026-01-31",
    readingTime: 8,
  },
];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return blogArticles.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: BlogArticle["category"]): BlogArticle[] {
  return blogArticles.filter((a) => a.category === category);
}

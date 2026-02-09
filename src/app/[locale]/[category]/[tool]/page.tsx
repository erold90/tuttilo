import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/routing";
import {
  getToolBySlug,
  categories,
  tools,
  type ToolCategoryId,
} from "@/lib/tools/registry";
import { ToolLayout } from "@/components/tools/tool-layout";
import { ToolLoader } from "@/components/tools/tool-loader";

const BASE_URL = "https://tuttilo.com";

// Set of tool IDs that have a component implementation
const implementedToolIds = new Set([
  "word-counter", "json-formatter", "base64", "lorem-ipsum", "color-picker",
  "regex-tester", "image-converter", "image-editor", "pdf-organizer",
  "compress-pdf", "qr-code", "voice-recorder", "screen-recorder",
  "video-to-mp3", "audio-cutter", "pdf-editor", "pdf-fill-sign", "pdf-images",
  "unlock-pdf", "pdf-word", "pdf-excel", "pdf-pptx", "pdf-protect",
  "pdf-page-numbers", "pdf-watermark", "pdf-ocr", "pdf-repair", "pdf-to-pdfa",
  "html-to-pdf", "pdf-flatten", "pdf-compare",
  "pdf-crop",
  "compress-video", "trim-video", "video-to-gif", "audio-converter",
  "youtube-thumbnail",
  "case-converter", "diff-checker", "markdown-editor",
  "hex-rgb", "url-encoder", "timestamp",
  "password-generator", "hash-generator", "uuid-generator",
  "jwt-decoder", "css-minifier", "sql-formatter",
  "image-compressor", "image-resizer", "image-cropper",
  "image-to-text", "meme-maker", "add-text-to-image",
  "video-converter", "rotate-video", "mute-video",
  "change-video-speed", "resize-video",
  "audio-joiner", "change-audio-speed", "text-to-speech",
  "reverse-audio", "change-audio-volume",
  "csv-json", "text-formatter", "notepad",
  "markdown-to-html", "find-replace",
  "pdf-to-text", "pdf-metadata", "grayscale-pdf",
  "redact-pdf", "extract-pdf-images",
  "youtube-money-calculator", "youtube-embed-generator", "youtube-seo-generator",
  "youtube-channel-name-generator", "youtube-watch-time-calculator",
  "youtube-video-analyzer", "youtube-channel-analyzer",
  // Calculators
  "scientific-calculator", "percentage-calculator", "bmi-calculator",
  "loan-calculator", "mortgage-calculator", "compound-interest-calculator",
  "roi-calculator", "tip-calculator", "salary-calculator",
  "vat-calculator", "profit-margin-calculator", "discount-calculator",
  "age-calculator", "date-diff-calculator", "calorie-calculator",
  "fraction-calculator", "grade-calculator", "break-even-calculator",
  // Converters
  "length-converter", "weight-converter", "temperature-converter",
  "data-size-converter", "area-converter",
  "volume-converter", "speed-converter", "time-converter",
  "fuel-economy-converter", "shoe-size-converter",
  "pressure-converter", "energy-converter", "number-base-converter",
  "roman-numeral-converter", "power-converter",
  // Color & Design
  "gradient-generator", "palette-generator", "contrast-checker",
  "box-shadow-generator", "border-radius-generator", "glassmorphism-generator",
  "animation-generator", "clip-path-generator",
  "flexbox-generator", "color-blindness-simulator", "palette-from-image",
  "font-pair-suggester", "css-pattern-generator",
  // Security
  "password-strength-checker", "hmac-generator", "aes-encrypt-decrypt",
  "crc32-checker", "credit-card-validator", "totp-generator",
  "rsa-key-generator", "pbkdf2-generator",
  // Data conversion
  "xml-json-converter", "yaml-json-converter", "html-entity-encoder",
  "json-path-evaluator", "csv-editor", "markdown-table-generator",
  "sql-to-csv", "yaml-validator",
  // Dev Tools Extra (Phase 2.1)
  "javascript-minifier", "html-minifier", "json-diff", "cron-parser",
  "chmod-calculator", "http-status-codes", "json-to-typescript",
  "text-to-binary", "url-parser", "color-converter",
]);

export function generateStaticParams() {
  return tools
    .filter((t) => t.isAvailable)
    .flatMap((tool) => {
      const cat = categories.find((c) => c.id === tool.category);
      if (!cat) return [];
      return locales.map((locale) => ({
        locale,
        category: cat.slug,
        tool: tool.slug,
      }));
    });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; tool: string }>;
}): Promise<Metadata> {
  const { locale, category, tool: toolSlug } = await params;
  const toolData = getToolBySlug(category as ToolCategoryId, toolSlug);
  if (!toolData) return {};

  const t = await getTranslations({ locale, namespace: "tools" });
  const name = t(`${toolData.id}.name`);
  const shortDesc = t(`${toolData.id}.description`);
  const cat = categories.find((c) => c.id === category);

  // Prefer seo.description (130-160 char) over short description for meta tags
  let description = shortDesc;
  try {
    const seoDesc = t(`${toolData.id}.seo.description`);
    if (seoDesc && !seoDesc.startsWith("tools.")) description = seoDesc;
  } catch {}

  // Prefer seo.title (50-60 char, keyword-optimized) over short name
  let title = name;
  try {
    const seoTitle = t(`${toolData.id}.seo.title`);
    if (seoTitle && !seoTitle.startsWith("tools.")) title = seoTitle;
  } catch {}

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/${category}/${toolSlug}`,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [
            l,
            `${BASE_URL}/${l}/${category}/${toolSlug}`,
          ])
        ),
        "x-default": `${BASE_URL}/en/${category}/${toolSlug}`,
      },
    },
    openGraph: {
      title: `${name} | Tuttilo`,
      description,
      url: `${BASE_URL}/${locale}/${category}/${toolSlug}`,
      siteName: "Tuttilo",
      locale,
      type: "website",
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${name} | Tuttilo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | Tuttilo`,
      description,
      images: [`${BASE_URL}/og-image.png`],
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; tool: string }>;
}) {
  const { locale, category, tool: toolSlug } = await params;

  const validCategory = categories.find((c) => c.slug === category);
  if (!validCategory) notFound();

  const toolData = getToolBySlug(category as ToolCategoryId, toolSlug);
  if (!toolData) notFound();

  if (!toolData.isAvailable || !implementedToolIds.has(toolData.id)) notFound();

  // Structured data
  const t = await getTranslations({ locale, namespace: "tools" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const toolName = t(`${toolData.id}.name`);
  const toolDesc = t(`${toolData.id}.description`);
  const toolUrl = `${BASE_URL}/${locale}/${category}/${toolSlug}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tNav("home"), item: `${BASE_URL}/${locale}`, "@id": `${BASE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: tNav(validCategory.id), item: `${BASE_URL}/${locale}/${category}`, "@id": `${BASE_URL}/${locale}/${category}` },
      { "@type": "ListItem", position: 3, name: toolName, item: toolUrl, "@id": toolUrl },
    ],
  };

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: toolName,
    description: toolDesc,
    url: toolUrl,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Organization", name: "Tuttilo", url: BASE_URL },
    featureList: ["Free to use", "No registration required", "Browser-based processing", "Privacy-first — no server uploads"],
  };

  const faqEntries: Array<{ "@type": string; name: string; acceptedAnswer: { "@type": string; text: string } }> = [];
  for (let i = 1; i <= 8; i++) {
    try {
      const q = t(`${toolData.id}.faq.q${i}`);
      const a = t(`${toolData.id}.faq.a${i}`);
      if (q && !q.startsWith("tools.") && a && !a.startsWith("tools.")) {
        faqEntries.push({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        });
      }
    } catch { break; }
  }

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries,
  };

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: tCommon("howToSchema.name", { toolName }),
    description: toolDesc,
    totalTime: "PT2M",
    tool: { "@type": "HowToTool", name: "Web browser" },
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: tCommon("howItWorks.upload.title"),
        text: tCommon("howToSchema.step1"),
        url: `${toolUrl}#upload`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: tCommon("howItWorks.process.title"),
        text: tCommon("howToSchema.step2"),
        url: `${toolUrl}#settings`,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: tCommon("howItWorks.download.title"),
        text: tCommon("howToSchema.step3"),
        url: `${toolUrl}#download`,
      },
    ],
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }} />
      <ToolLayout toolId={toolData.id} category={category}>
        <ToolLoader toolId={toolData.id} />
      </ToolLayout>
    </div>
  );
}

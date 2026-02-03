export const runtime = "edge";

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/routing";
import {
  getToolBySlug,
  categories,
  type ToolCategoryId,
} from "@/lib/tools/registry";
import { ToolLayout } from "@/components/tools/tool-layout";

// Tool components — Sprint 1 (Text/Dev)
import { WordCounter } from "@/components/tools/word-counter";
import { JsonFormatter } from "@/components/tools/json-formatter";
import { Base64Encoder } from "@/components/tools/base64-encoder";
import { LoremIpsum } from "@/components/tools/lorem-ipsum";
import { ColorPicker } from "@/components/tools/color-picker";
import { RegexTester } from "@/components/tools/regex-tester";
// Sprint 2 (Image)
import { ImageConverter } from "@/components/tools/image-converter";
import { ImageEditor } from "@/components/tools/image-editor";
// Sprint 3 (PDF)
import { PdfOrganizer } from "@/components/tools/pdf-organizer";
// Sprint 4 (Audio/Media)
import { QrCode } from "@/components/tools/qr-code";
import { VoiceRecorder } from "@/components/tools/voice-recorder";
import { ScreenRecorder } from "@/components/tools/screen-recorder";
// VideoToMp3 moved to ffmpeg-tools.tsx (uses FFmpeg)
import { AudioCutter } from "@/components/tools/audio-cutter";
import { CompressPdf } from "@/components/tools/compress-pdf";
// Sprint 5 (PDF Advanced — consolidated)
import { PdfEditorUnified } from "@/components/tools/pdf-editor-unified";
import { PdfImages } from "@/components/tools/pdf-images";
import { UnlockPdf } from "@/components/tools/unlock-pdf";
import { PdfWord } from "@/components/tools/pdf-word";
import { PdfProtect } from "@/components/tools/pdf-protect";
import { PdfPageNumbers } from "@/components/tools/pdf-page-numbers";
import { PdfWatermark } from "@/components/tools/pdf-watermark";
import { PdfToExcel } from "@/components/tools/pdf-to-excel";
import { PdfToPptx } from "@/components/tools/pdf-to-pptx";
import { PdfOcr } from "@/components/tools/pdf-ocr";
import { PdfRepair } from "@/components/tools/pdf-repair";
import { PdfToPdfa } from "@/components/tools/pdf-to-pdfa";
// Sprint 6 (Video) — via client wrapper for ssr:false (FFmpeg references document)
import { CompressVideo, TrimVideo, VideoToGif, AudioConverter, VideoToMp3 } from "@/components/tools/ffmpeg-tools";
import { YoutubeThumbnail } from "@/components/tools/youtube-thumbnail";

const BASE_URL = "https://tuttilo.com";

const toolComponents: Record<string, React.ComponentType> = {
  "word-counter": WordCounter,
  "json-formatter": JsonFormatter,
  "base64": Base64Encoder,
  "lorem-ipsum": LoremIpsum,
  "color-picker": ColorPicker,
  "regex-tester": RegexTester,
  "image-converter": ImageConverter,
  "image-editor": ImageEditor,
  "pdf-organizer": PdfOrganizer,
  "compress-pdf": CompressPdf,
  "qr-code": QrCode,
  "voice-recorder": VoiceRecorder,
  "screen-recorder": ScreenRecorder,
  "video-to-mp3": VideoToMp3,
  "audio-cutter": AudioCutter,
  "pdf-editor": PdfEditorUnified,
  "pdf-images": PdfImages,
  "unlock-pdf": UnlockPdf,
  "pdf-word": PdfWord,
  "pdf-to-excel": PdfToExcel,
  "pdf-to-pptx": PdfToPptx,
  "pdf-protect": PdfProtect,
  "pdf-page-numbers": PdfPageNumbers,
  "pdf-watermark": PdfWatermark,
  "pdf-ocr": PdfOcr,
  "pdf-repair": PdfRepair,
  "pdf-to-pdfa": PdfToPdfa,
  "compress-video": CompressVideo,
  "trim-video": TrimVideo,
  "video-to-gif": VideoToGif,
  "audio-converter": AudioConverter,
  "youtube-thumbnail": YoutubeThumbnail,
};

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
  const description = t(`${toolData.id}.description`);
  const cat = categories.find((c) => c.id === category);

  return {
    title: name,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/${category}/${toolSlug}`,
      languages: Object.fromEntries(
        locales.map((l) => [
          l,
          `${BASE_URL}/${l}/${category}/${toolSlug}`,
        ])
      ),
    },
    openGraph: {
      title: `${name} | Tuttilo`,
      description,
      url: `${BASE_URL}/${locale}/${category}/${toolSlug}`,
      siteName: "Tuttilo",
      locale,
      type: "website",
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

  const ToolComponent = toolComponents[toolData.id];
  if (!ToolComponent) notFound();

  // Structured data
  const t = await getTranslations({ locale, namespace: "tools" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const toolName = t(`${toolData.id}.name`);
  const toolDesc = t(`${toolData.id}.description`);
  const toolUrl = `${BASE_URL}/${locale}/${category}/${toolSlug}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tNav("home"), item: `${BASE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: tNav(validCategory.id), item: `${BASE_URL}/${locale}/${category}` },
      { "@type": "ListItem", position: 3, name: toolName, item: toolUrl },
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
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3].map((i) => ({
      "@type": "Question",
      name: t(`${toolData.id}.faq.q${i}`),
      acceptedAnswer: { "@type": "Answer", text: t(`${toolData.id}.faq.a${i}`) },
    })),
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <ToolLayout toolId={toolData.id} category={category}>
        <ToolComponent />
      </ToolLayout>
    </div>
  );
}

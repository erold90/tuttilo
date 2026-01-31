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
import { CompressImage } from "@/components/tools/compress-image";
import { ResizeImage } from "@/components/tools/resize-image";
import { CropImage } from "@/components/tools/crop-image";
import { PngToJpg } from "@/components/tools/png-to-jpg";
import { JpgToPng } from "@/components/tools/jpg-to-png";
import { WebpToPng } from "@/components/tools/webp-to-png";
import { WebpToJpg } from "@/components/tools/webp-to-jpg";
import { HeicToJpg } from "@/components/tools/heic-to-jpg";

const BASE_URL = "https://tuttilo.com";

const toolComponents: Record<string, React.ComponentType> = {
  "word-counter": WordCounter,
  "json-formatter": JsonFormatter,
  "base64": Base64Encoder,
  "lorem-ipsum": LoremIpsum,
  "color-picker": ColorPicker,
  "regex-tester": RegexTester,
  "compress-image": CompressImage,
  "resize-image": ResizeImage,
  "crop-image": CropImage,
  "png-to-jpg": PngToJpg,
  "jpg-to-png": JpgToPng,
  "webp-to-png": WebpToPng,
  "webp-to-jpg": WebpToJpg,
  "heic-to-jpg": HeicToJpg,
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

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <ToolLayout toolId={toolData.id} category={category}>
        <ToolComponent />
      </ToolLayout>
    </div>
  );
}

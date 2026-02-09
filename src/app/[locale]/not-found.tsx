"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { House, FilePdf, Image, VideoCamera, Microphone, Code, TextT, YoutubeLogo } from "@phosphor-icons/react";

type CatLink = { href: string; icon: typeof FilePdf; labelKey: "pdfTools" | "imageTools" | "videoTools" | "audioTools" | "textTools" | "devTools" | "youtubeTools" };

const categoryLinks: CatLink[] = [
  { href: "/pdf", icon: FilePdf, labelKey: "pdfTools" },
  { href: "/image", icon: Image, labelKey: "imageTools" },
  { href: "/video", icon: VideoCamera, labelKey: "videoTools" },
  { href: "/audio", icon: Microphone, labelKey: "audioTools" },
  { href: "/text", icon: TextT, labelKey: "textTools" },
  { href: "/developer", icon: Code, labelKey: "devTools" },
  { href: "/youtube", icon: YoutubeLogo, labelKey: "youtubeTools" },
];

export default function NotFound() {
  const t = useTranslations("pages.notFound");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-8xl font-bold text-muted-foreground/20">404</div>
      <h1 className="mb-3 text-3xl font-bold">{t("title")}</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        {t("description")}
      </p>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {categoryLinks.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <cat.icon className="h-4 w-4 text-primary" weight="duotone" />
            {t(cat.labelKey)}
          </Link>
        ))}
      </div>

      <div className="flex gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <House className="h-4 w-4" weight="duotone" />
          {t("goHome")}
        </Link>
      </div>
    </div>
  );
}

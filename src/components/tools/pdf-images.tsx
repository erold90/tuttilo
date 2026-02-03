"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PdfToImages } from "./pdf-to-images";
import { ImagesToPdf } from "./images-to-pdf";

export function PdfImages() {
  const t = useTranslations("tools.pdf-images.ui");
  const [mode, setMode] = useState<"toImages" | "fromImages">("toImages");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
        <button
          onClick={() => setMode("toImages")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === "toImages" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("tabToImages")}
        </button>
        <button
          onClick={() => setMode("fromImages")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === "fromImages" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("tabFromImages")}
        </button>
      </div>
      {mode === "toImages" ? <PdfToImages /> : <ImagesToPdf />}
    </div>
  );
}

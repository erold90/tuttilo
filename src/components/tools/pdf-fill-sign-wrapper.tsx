"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PdfFillSign } from "./pdf-fill-sign";
import { PenNib } from "@phosphor-icons/react";

export function PdfFillSignWrapper() {
  const t = useTranslations("tools.pdf-fill-sign.ui");
  const [file, setFile] = useState<File | null>(null);
  const [rawBytes, setRawBytes] = useState<ArrayBuffer | null>(null);

  const loadFile = useCallback(async (f: File) => {
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return;
    const bytes = await f.arrayBuffer();
    setFile(f);
    setRawBytes(bytes);
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setRawBytes(null);
  }, []);

  if (!file || !rawBytes) {
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("border-primary");
          if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
        }}
        onClick={() => {
          const i = document.createElement("input");
          i.type = "file";
          i.accept = ".pdf";
          i.onchange = () => i.files?.[0] && loadFile(i.files[0]);
          i.click();
        }}
        className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
      >
        <PenNib size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-lg font-medium">{t("dropzone")}</p>
        <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
        <p className="font-medium truncate text-sm">{file.name}</p>
        <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground ml-2 shrink-0">
          ✕
        </button>
      </div>
      <PdfFillSign file={file} rawBytes={rawBytes} onReset={reset} />
    </div>
  );
}

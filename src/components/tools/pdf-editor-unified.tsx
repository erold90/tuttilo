"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PdfEditor } from "./pdf-editor";
import { PdfFillSign } from "./pdf-fill-sign";

export function PdfEditorUnified() {
  const t = useTranslations("tools.pdf-editor.ui");
  const [mode, setMode] = useState<"edit" | "fill">("edit");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
        <button
          onClick={() => setMode("edit")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === "edit" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("tabEdit")}
        </button>
        <button
          onClick={() => setMode("fill")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === "fill" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("tabFillSign")}
        </button>
      </div>
      {mode === "edit" ? <PdfEditor /> : <PdfFillSign />}
    </div>
  );
}

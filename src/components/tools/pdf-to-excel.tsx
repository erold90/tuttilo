"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { configurePdfjsWorker } from "@/lib/pdf-utils";
import { Table } from "@phosphor-icons/react";
import { SafariPdfBanner } from "@/components/safari-pdf-banner";
import { useFileInput } from "@/hooks/use-file-input";

interface PdfTextItem {
  str: string;
  transform: number[];
}

export function PdfToExcel() {
  const t = useTranslations("tools.pdf-to-excel.ui");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null);

  useEffect(() => {
    import("pdfjs-dist").then((lib) => {
      configurePdfjsWorker(lib);
      setPdfjsLib(lib);
    }).catch((err) => {
      console.error("Failed to load pdfjs-dist:", err);
    });
  }, []);

  const loadFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setError(""); setResultUrl(""); setFile(f);
  }, []);

  const extract = useCallback(async () => {
    if (!file || !pdfjsLib) return;
    setProcessing(true); setError(""); setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();

      for (let p = 1; p <= doc.numPages; p++) {
        const page = await doc.getPage(p);
        const content = await page.getTextContent();
        const items = content.items
          .filter((i) => "str" in i && (i as PdfTextItem).str.trim() !== "")
          .map((i) => i as unknown as PdfTextItem);

        if (items.length === 0) continue;

        const sheet = workbook.addWorksheet(`Page ${p}`);

        // Group by Y position (rows) with tolerance
        const yGroups = new Map<number, PdfTextItem[]>();
        for (const item of items) {
          const y = Math.round(item.transform[5] / 3) * 3; // round to 3pt tolerance
          if (!yGroups.has(y)) yGroups.set(y, []);
          yGroups.get(y)!.push(item);
        }

        // Sort rows top-to-bottom (descending Y in PDF coords)
        const sortedYs = [...yGroups.keys()].sort((a, b) => b - a);

        // Detect column positions from X coordinates
        const allXs = items.map((i) => Math.round(i.transform[4]));
        const uniqueXs = [...new Set(allXs)].sort((a, b) => a - b);

        // Merge nearby X positions (within 15pt)
        const colPositions: number[] = [];
        for (const x of uniqueXs) {
          if (colPositions.length === 0 || x - colPositions[colPositions.length - 1] > 15) {
            colPositions.push(x);
          }
        }

        for (const y of sortedYs) {
          const rowItems = yGroups.get(y)!.sort((a, b) => a.transform[4] - b.transform[4]);
          const rowData: string[] = new Array(colPositions.length).fill("");

          for (const item of rowItems) {
            const x = Math.round(item.transform[4]);
            let bestCol = 0;
            let bestDist = Infinity;
            for (let c = 0; c < colPositions.length; c++) {
              const dist = Math.abs(x - colPositions[c]);
              if (dist < bestDist) { bestDist = dist; bestCol = c; }
            }
            rowData[bestCol] = rowData[bestCol] ? `${rowData[bestCol]} ${item.str}` : item.str;
          }

          sheet.addRow(rowData);
        }

        // Auto-width columns
        sheet.columns.forEach((col) => {
          let maxLen = 10;
          col.eachCell?.((cell) => {
            const len = String(cell.value || "").length;
            if (len > maxLen) maxLen = Math.min(len, 50);
          });
          col.width = maxLen + 2;
        });

        setProgress(Math.round((p / doc.numPages) * 100));
      }

      doc.destroy();

      if (workbook.worksheets.length === 0) {
        setError(t("noTables"));
        return;
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("PDF→Excel error:", err);
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  }, [file, pdfjsLib, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a"); a.href = resultUrl;
    a.download = file.name.replace(/\.pdf$/i, ".xlsx"); a.click();
  }, [resultUrl, file]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setResultUrl(""); setError("");
  }, [resultUrl]);

  const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({ accept: ".pdf", onFile: (file) => loadFile(file) });

  return (
    <div className="space-y-6">
      <SafariPdfBanner />
      {!file ? (
        <>
          <input {...fileInputProps} />
          <div
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={openFileDialog}
          >
            <Table size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-medium">{t("dropzone")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
          </div>
        </>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
          </div>
          <button onClick={extract} disabled={processing || !pdfjsLib}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {processing ? `${t("processing")} ${progress}%` : t("extract")}
          </button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">✓</div>
          <p className="font-medium">{t("done")}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={download} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("download")}</button>
            <button onClick={reset} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
          </div>
        </div>
      )}
      {error && <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>}
    </div>
  );
}

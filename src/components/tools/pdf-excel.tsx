"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface PdfTextItem {
  str: string;
  transform: number[];
}

type Direction = "pdf-to-excel" | "excel-to-pdf" | null;

export function PdfExcel() {
  const t = useTranslations("tools.pdf-excel.ui");
  const [file, setFile] = useState<File | null>(null);
  const [direction, setDirection] = useState<Direction>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null);
  const htmlRef = useRef("");

  useEffect(() => {
    import("pdfjs-dist").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
      setPdfjsLib(lib);
    }).catch((err) => {
      console.error("Failed to load pdfjs-dist:", err);
    });
  }, []);

  const loadFile = useCallback(async (f: File) => {
    setError(""); setResultUrl(""); setSheetNames([]); htmlRef.current = "";

    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    const isExcel = f.type.includes("spreadsheetml") || f.type.includes("ms-excel") || /\.xlsx?$/i.test(f.name);

    if (!isPdf && !isExcel) return;

    if (isExcel) {
      try {
        const ExcelJS = await import("exceljs");
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(await f.arrayBuffer());
        setSheetNames(wb.worksheets.map(ws => ws.name));

        let html = `<!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;margin:20px;color:#222}
          h2{font-size:16px;margin:24px 0 8px;page-break-before:auto}
          table{border-collapse:collapse;width:100%;margin-bottom:20px;font-size:11px}
          th,td{border:1px solid #ccc;padding:6px 10px;text-align:left}
          th{background:#f0f0f0;font-weight:600}
          tr:nth-child(even){background:#fafafa}
          @media print{h2{page-break-before:always}h2:first-of-type{page-break-before:avoid}}
        </style></head><body>`;

        for (const ws of wb.worksheets) {
          html += `<h2>${ws.name}</h2><table>`;
          let isFirst = true;
          ws.eachRow((row) => {
            html += "<tr>";
            row.eachCell({ includeEmpty: true }, (cell) => {
              const tag = isFirst ? "th" : "td";
              const val = cell.text || "";
              html += `<${tag}>${val.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</${tag}>`;
            });
            html += "</tr>";
            isFirst = false;
          });
          html += "</table>";
        }
        html += "</body></html>";
        htmlRef.current = html;
      } catch (err) {
        console.error("Excel parse error:", err);
        setError(t("parseError"));
        return;
      }
    }

    setFile(f);
    setDirection(isPdf ? "pdf-to-excel" : "excel-to-pdf");
  }, [t]);

  const convertPdfToExcel = useCallback(async () => {
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
        const yGroups = new Map<number, PdfTextItem[]>();
        for (const item of items) {
          const y = Math.round(item.transform[5] / 3) * 3;
          if (!yGroups.has(y)) yGroups.set(y, []);
          yGroups.get(y)!.push(item);
        }

        const sortedYs = [...yGroups.keys()].sort((a, b) => b - a);
        const allXs = items.map((i) => Math.round(i.transform[4]));
        const uniqueXs = [...new Set(allXs)].sort((a, b) => a - b);
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

  const convertExcelToPdf = useCallback(async () => {
    if (!file || !htmlRef.current) return;
    setProcessing(true); setError("");
    try {
      const { jsPDF } = await import("jspdf");
      const container = document.createElement("div");
      container.style.cssText = "position:absolute;left:-9999px;top:0;width:800px;background:white;color:#222;font-family:Arial,sans-serif;font-size:11px;padding:20px";
      container.innerHTML = htmlRef.current.replace(/<!DOCTYPE[\s\S]*?<body>/, "").replace(/<\/body>[\s\S]*$/, "");
      document.body.appendChild(container);

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth() - 40;

      await new Promise<void>((resolve) => {
        pdf.html(container, {
          callback: () => resolve(),
          x: 20,
          y: 20,
          width: pageW,
          windowWidth: 800,
        });
      });

      document.body.removeChild(container);

      const blob = pdf.output("blob");
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Excel→PDF error:", err);
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  }, [file, resultUrl, t]);

  const convert = useCallback(() => {
    if (direction === "pdf-to-excel") convertPdfToExcel();
    else if (direction === "excel-to-pdf") convertExcelToPdf();
  }, [direction, convertPdfToExcel, convertExcelToPdf]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = direction === "pdf-to-excel"
      ? file.name.replace(/\.pdf$/i, ".xlsx")
      : file.name.replace(/\.xlsx?$/i, ".pdf");
    a.click();
  }, [resultUrl, file, direction]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setDirection(null); setResultUrl(""); setError("");
    setProgress(0); setSheetNames([]); htmlRef.current = "";
  }, [resultUrl]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf,.xlsx,.xls"; input.onchange = () => input.files?.[0] && loadFile(input.files[0]); input.click(); }}
        >
          <div className="text-4xl mb-3">📊</div>
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate flex-1">{file.name}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${direction === "pdf-to-excel" ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600"}`}>
                {direction === "pdf-to-excel" ? "PDF → Excel" : "Excel → PDF"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
            {direction === "excel-to-pdf" && sheetNames.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">{t("sheets")}: {sheetNames.join(", ")}</p>
            )}
          </div>

          {direction === "excel-to-pdf" && htmlRef.current && (
            <div className="border border-border rounded-lg overflow-hidden bg-white">
              <iframe srcDoc={htmlRef.current} className="w-full h-64 pointer-events-none" title="Preview" />
            </div>
          )}

          <button
            onClick={convert}
            disabled={processing || (direction === "pdf-to-excel" && !pdfjsLib)}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {processing ? (progress > 0 ? `${t("processing")} ${progress}%` : t("processing")) : t("convert")}
          </button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">✓</div>
          <p className="font-medium">{t("done")}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={download} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
              {t(direction === "pdf-to-excel" ? "downloadXlsx" : "downloadPdf")}
            </button>
            <button onClick={reset} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
          </div>
        </div>
      )}
      {error && <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>}
    </div>
  );
}

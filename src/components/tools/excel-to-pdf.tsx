"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Table } from "@phosphor-icons/react";
import { useFileInput } from "@/hooks/use-file-input";

export function ExcelToPdf() {
  const t = useTranslations("tools.excel-to-pdf.ui");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const htmlRef = useRef("");

  const loadFile = useCallback(async (f: File) => {
    const ext = f.name.toLowerCase();
    if (!ext.endsWith(".xlsx") && !ext.endsWith(".xls")) return;
    setError(""); setResultUrl(""); setSheetNames([]);
    try {
      const ExcelJS = await import("exceljs");
      const wb = new ExcelJS.Workbook();
      const buf = await f.arrayBuffer();
      await wb.xlsx.load(buf);
      const names = wb.worksheets.map(ws => ws.name);
      setSheetNames(names);

      // Generate HTML for all sheets
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
      setFile(f);
    } catch (err) {
      console.error("Excel parse error:", err);
      setError(t("parseError"));
    }
  }, [t]);

  const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({
    accept: ".xlsx,.xls",
    onFile: loadFile,
  });

  const convert = useCallback(async () => {
    if (!file || !htmlRef.current) return;
    setProcessing(true); setError("");
    try {
      const { jsPDF } = await import("jspdf");
      // Create a temporary container for rendering
      const container = document.createElement("div");
      container.style.cssText = "position:absolute;left:-9999px;top:0;width:800px;background:white;color:#222;font-family:Arial,sans-serif;font-size:11px;padding:20px";
      container.innerHTML = htmlRef.current.replace(/<!DOCTYPE[\s\S]*?<body>/, "").replace(/<\/body>[\s\S]*$/, "");
      document.body.appendChild(container);

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth() - 40;
      const pageH = pdf.internal.pageSize.getHeight() - 40;

      // Use html method for proper rendering
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

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a"); a.href = resultUrl;
    a.download = file.name.replace(/\.xlsx?$/i, ".pdf"); a.click();
  }, [resultUrl, file]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setResultUrl(""); setError(""); setSheetNames([]); htmlRef.current = "";
  }, [resultUrl]);

  return (
    <div className="space-y-6">
      {!file ? (
        <>
          <input {...fileInputProps} />
          <div
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
            onClick={openFileDialog}
            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
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
            {sheetNames.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {t("sheets")}: {sheetNames.join(", ")}
              </p>
            )}
          </div>
          {htmlRef.current && (
            <div className="border border-border rounded-lg overflow-hidden bg-white">
              <iframe ref={iframeRef} srcDoc={htmlRef.current}
                className="w-full h-64 pointer-events-none" title="Preview" />
            </div>
          )}
          <button onClick={convert} disabled={processing}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {processing ? t("processing") : t("convert")}
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

"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

function stripScripts(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/on\w+\s*=\s*"[^"]*"/gi, "").replace(/on\w+\s*=\s*'[^']*'/gi, "");
}

export function HtmlToPdf() {
  const t = useTranslations("tools.html-to-pdf.ui");
  const [htmlInput, setHtmlInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sampleHtml = `<h1>Hello World</h1>
<p>This is a sample HTML document converted to PDF.</p>
<table border="1" cellpadding="8" cellspacing="0">
  <tr><th>Name</th><th>Value</th></tr>
  <tr><td>Item 1</td><td>100</td></tr>
  <tr><td>Item 2</td><td>200</td></tr>
</table>`;

  const safeHtml = stripScripts(htmlInput);

  const previewHtml = `<!DOCTYPE html><html><head><style>
    body{font-family:Arial,sans-serif;padding:20px;color:#222;max-width:100%;overflow-x:hidden}
    table{border-collapse:collapse}th,td{padding:6px 12px}
    img{max-width:100%;height:auto}
  </style></head><body>${safeHtml}</body></html>`;

  const convert = useCallback(async () => {
    if (!htmlInput.trim()) { setError(t("emptyError")); return; }
    setProcessing(true); setError("");
    try {
      const { jsPDF } = await import("jspdf");
      const container = document.createElement("div");
      container.style.cssText = "position:absolute;left:-9999px;top:0;width:800px;background:white;color:#222;font-family:Arial,sans-serif;padding:20px";
      container.innerHTML = safeHtml;
      document.body.appendChild(container);

      const pdf = new jsPDF({ orientation, unit: "pt", format: "a4" });
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
      console.error("HTML→PDF error:", err);
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  }, [htmlInput, orientation, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a"); a.href = resultUrl;
    a.download = "document.pdf"; a.click();
  }, [resultUrl]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setHtmlInput(""); setResultUrl(""); setError("");
  }, [resultUrl]);

  return (
    <div className="space-y-6">
      {!resultUrl ? (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">{t("inputLabel")}</label>
              <button onClick={() => setHtmlInput(sampleHtml)} className="text-xs text-primary hover:underline">
                {t("loadSample")}
              </button>
            </div>
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder={t("placeholder")}
              className="w-full h-48 rounded-lg border border-border bg-background p-3 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {htmlInput.trim() && (
            <div>
              <p className="text-sm font-medium mb-2">{t("preview")}</p>
              <div className="border border-border rounded-lg overflow-hidden bg-white">
                <iframe ref={iframeRef} srcDoc={previewHtml} sandbox="allow-same-origin"
                  className="w-full h-48 pointer-events-none" title="Preview" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">{t("orientation")}</label>
            <div className="flex gap-2">
              {(["portrait", "landscape"] as const).map((o) => (
                <button key={o} onClick={() => setOrientation(o)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${orientation === o ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                  {t(o)}
                </button>
              ))}
            </div>
          </div>

          <button onClick={convert} disabled={processing || !htmlInput.trim()}
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

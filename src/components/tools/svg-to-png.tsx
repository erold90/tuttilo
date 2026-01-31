"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

export function SvgToPng() {
  const t = useTranslations("tools.svg-to-png.ui");
  const [file, setFile] = useState<File | null>(null);
  const [svgPreview, setSvgPreview] = useState("");
  const [scale, setScale] = useState(2);
  const [result, setResult] = useState<{ url: string; name: string; size: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const loadSvg = useCallback((f: File) => {
    if (!f.type.includes("svg")) return;
    setError("");
    setResult(null);
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setSvgPreview(reader.result as string);
    reader.readAsText(f);
  }, []);

  const convert = useCallback(async () => {
    if (!svgPreview) return;
    setProcessing(true);
    setError("");
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgPreview, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) throw new Error("Invalid SVG");

      let w = parseFloat(svgEl.getAttribute("width") || "0");
      let h = parseFloat(svgEl.getAttribute("height") || "0");
      const vb = svgEl.getAttribute("viewBox");
      if ((!w || !h) && vb) {
        const parts = vb.split(/[\s,]+/).map(Number);
        w = parts[2] || 300;
        h = parts[3] || 300;
      }
      if (!w) w = 300;
      if (!h) h = 300;

      const canvas = document.createElement("canvas");
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext("2d")!;

      const img = new Image();
      const blob = new Blob([svgPreview], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Failed to load SVG"));
        };
        img.src = url;
      });

      const pngBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png");
      });

      const baseName = file?.name.replace(/\.svg$/i, "") || "image";
      setResult({
        url: URL.createObjectURL(pngBlob),
        name: `${baseName}_${scale}x.png`,
        size: pngBlob.size,
      });
    } catch {
      setError(t("convertError"));
    } finally {
      setProcessing(false);
    }
  }, [svgPreview, scale, file, t]);

  const download = useCallback(() => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.name;
    a.click();
  }, [result]);

  const reset = useCallback(() => {
    if (result) URL.revokeObjectURL(result.url);
    setFile(null);
    setSvgPreview("");
    setResult(null);
    setError("");
  }, [result]);

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
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadSvg(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".svg"; input.onchange = () => input.files?.[0] && loadSvg(input.files[0]); input.click(); }}
        >
          <div className="text-4xl mb-3">🖼️</div>
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : !result ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
          </div>

          {svgPreview && (
            <div className="flex justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZGRkIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNkZGQiLz48L3N2Zz4=')] rounded-lg p-4 max-h-64 overflow-hidden">
              <div dangerouslySetInnerHTML={{ __html: svgPreview }} className="max-w-full max-h-56 [&>svg]:max-w-full [&>svg]:max-h-56 [&>svg]:w-auto [&>svg]:h-auto" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">{t("scale")}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    scale === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={convert}
            disabled={processing}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {processing ? t("processing") : t("convert")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZGRkIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNkZGQiLz48L3N2Zz4=')] rounded-lg p-4">
            <img src={result.url} alt="PNG result" className="max-w-full max-h-64" />
          </div>
          <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{result.name}</p>
              <p className="text-sm text-muted-foreground">{formatSize(result.size)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={download} className="py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                {t("download")}
              </button>
              <button onClick={reset} className="py-2 px-4 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors">
                {t("reset")}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}
    </div>
  );
}

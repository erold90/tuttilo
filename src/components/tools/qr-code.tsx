"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";

export function QrCode() {
  const t = useTranslations("tools.qr-code.ui");
  const [text, setText] = useState("");
  const [size, setSize] = useState(300);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = useCallback(async () => {
    if (!text.trim()) return;
    setError("");
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      });
      setDataUrl(canvas.toDataURL("image/png"));
    } catch (err) {
      console.error("QRCode error:", err);
      setError(t("generateError"));
    }
  }, [text, size, fgColor, bgColor, errorLevel, t]);

  const download = useCallback(() => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
  }, [dataUrl]);

  const reset = useCallback(() => {
    setText("");
    setDataUrl("");
    setError("");
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t("textLabel")}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full h-24 px-3 py-2 rounded-lg border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("size")}: {size}px
            </label>
            <input
              type="range"
              min="128"
              max="512"
              step="8"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t("errorLevel")}</label>
            <select
              value={errorLevel}
              onChange={(e) => setErrorLevel(e.target.value as "L" | "M" | "Q" | "H")}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t("fgColor")}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-border"
              />
              <input
                type="text"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t("bgColor")}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-border"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-sm"
              />
            </div>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={!text.trim()}
          className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {t("generate")}
        </button>
      </div>

      <div className="flex flex-col items-center gap-4">
        <canvas
          ref={canvasRef}
          className={dataUrl ? "rounded-lg border border-border" : "hidden"}
        />
        {dataUrl && (
          <div className="flex gap-2">
            <button
              onClick={download}
              className="py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              {t("download")}
            </button>
            <button
              onClick={reset}
              className="py-2 px-4 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
            >
              {t("reset")}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}
    </div>
  );
}

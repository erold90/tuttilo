"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function PlaceholderImageGenerator() {
  const t = useTranslations("tools.placeholder-image-generator");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [bgColor, setBgColor] = useState("#cccccc");
  const [textColor, setTextColor] = useState("#666666");
  const [text, setText] = useState("");
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    const displayText = text || `${width} \u00d7 ${height}`;
    const fontSize = Math.max(12, Math.min(width, height) / 8);
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayText, width / 2, height / 2);
  }, [width, height, bgColor, textColor, text]);

  useEffect(() => { draw(); }, [draw]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    draw();
    const mime = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
    const url = canvas.toDataURL(mime, 0.92);
    const a = document.createElement("a"); a.href = url; a.download = `placeholder-${width}x${height}.${format}`; a.click();
  }, [draw, width, height, format]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("ui.width")}
          <input type="number" min={1} max={4096} value={width} onChange={e => setWidth(Math.max(1, +e.target.value))} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("ui.height")}
          <input type="number" min={1} max={4096} value={height} onChange={e => setHeight(Math.max(1, +e.target.value))} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("ui.bgColor")}
          <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="mt-1 w-full h-9 rounded border border-zinc-300 dark:border-zinc-600 cursor-pointer" />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("ui.textColor")}
          <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="mt-1 w-full h-9 rounded border border-zinc-300 dark:border-zinc-600 cursor-pointer" />
        </label>
      </div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {t("ui.customText")}
        <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder={`${width} \u00d7 ${height}`} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
      </label>
      <div className="flex items-center gap-4">
        <select value={format} onChange={e => setFormat(e.target.value as "png" | "jpeg" | "webp")} className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
          <option value="webp">WebP</option>
        </select>
        <button onClick={download} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.download")}</button>
      </div>
      <div className="overflow-auto bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <canvas ref={canvasRef} className="mx-auto max-w-full" style={{ maxHeight: 400 }} />
      </div>
    </div>
  );
}

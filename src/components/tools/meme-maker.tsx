"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

const FONTS = [
  "Impact",
  "Arial Black",
  "Comic Sans MS",
  "Arial",
  "Georgia",
  "Verdana",
  "Courier New",
  "Times New Roman",
];

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

export function MemeMaker() {
  const t = useTranslations("tools.meme-maker.ui");
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#FFFFFF");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [font, setFont] = useState("Impact");
  const [uppercase, setUppercase] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback((f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
    };
    img.src = url;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    const scale = img.naturalWidth / 800;
    const fs = fontSize * scale;
    ctx.font = `bold ${fs}px "${font}", Impact, sans-serif`;
    ctx.fillStyle = color;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = fs / 10;
    ctx.textAlign = "center";
    ctx.lineJoin = "round";
    ctx.textBaseline = "top";

    const pad = 20 * scale;
    const maxW = canvas.width - pad * 2;

    const drawLines = (lines: string[], startY: number, direction: 1 | -1) => {
      const lineH = fs * 1.15;
      for (let i = 0; i < lines.length; i++) {
        const y =
          direction === 1
            ? startY + i * lineH
            : startY - (lines.length - 1 - i) * lineH;
        ctx.strokeText(lines[i], canvas.width / 2, y);
        ctx.fillText(lines[i], canvas.width / 2, y);
      }
    };

    if (topText) {
      const txt = uppercase ? topText.toUpperCase() : topText;
      const lines = wrapText(ctx, txt, maxW);
      drawLines(lines, pad, 1);
    }

    if (bottomText) {
      ctx.textBaseline = "bottom";
      const txt = uppercase ? bottomText.toUpperCase() : bottomText;
      const lines = wrapText(ctx, txt, maxW);
      drawLines(lines, canvas.height - pad, -1);
    }
  }, [topText, bottomText, fontSize, color, strokeColor, font, uppercase, imgUrl]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((b) => {
      if (!b) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = "meme.png";
      a.click();
    }, "image/png");
  }, []);

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]);
          }}
          className="cursor-pointer rounded-xl border-2 border-dashed border-border p-12 text-center hover:border-primary/50"
        >
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground">{t("formats")}</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && load(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-3 md:col-span-1">
            {/* Top text */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("topText")}
              </label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                placeholder={t("topPlaceholder")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            {/* Bottom text */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("bottomText")}
              </label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                placeholder={t("bottomPlaceholder")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            {/* Font family */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("font")}
              </label>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Font size */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("fontSize")}: {fontSize}px
              </label>
              <input
                type="range"
                min={16}
                max={96}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Colors row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium">
                  {t("color")}
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-full rounded border border-border cursor-pointer"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  {t("strokeColor")}
                </label>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="h-9 w-full rounded border border-border cursor-pointer"
                />
              </div>
            </div>

            {/* Uppercase toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm">{t("uppercase")}</span>
            </label>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={download}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {t("download")}
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setTopText("");
                  setBottomText("");
                }}
                className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted"
              >
                {t("reset")}
              </button>
            </div>
          </div>

          {/* Preview canvas */}
          <div className="md:col-span-2 flex items-start justify-center">
            <canvas
              ref={canvasRef}
              className="max-w-full rounded-lg border border-border"
            />
          </div>
        </div>
      )}
    </div>
  );
}

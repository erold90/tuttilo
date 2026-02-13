"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { LinkSimple, LinkBreak } from "@phosphor-icons/react";

type OutputFormat = "png" | "jpeg" | "webp";
type FitMode = "stretch" | "contain" | "cover";

const PRESETS = [
  { label: "Instagram Post", w: 1080, h: 1080 },
  { label: "Instagram Story", w: 1080, h: 1920 },
  { label: "Facebook Cover", w: 820, h: 312 },
  { label: "Twitter Header", w: 1500, h: 500 },
  { label: "YouTube Thumbnail", w: 1280, h: 720 },
  { label: "LinkedIn Banner", w: 1584, h: 396 },
  { label: "HD (1280x720)", w: 1280, h: 720 },
  { label: "Full HD (1920x1080)", w: 1920, h: 1080 },
  { label: "4K (3840x2160)", w: 3840, h: 2160 },
];

function getMime(f: OutputFormat): string {
  return `image/${f}`;
}

function getExt(f: OutputFormat): string {
  return f === "jpeg" ? "jpg" : f;
}

export function ImageResizer() {
  const t = useTranslations("tools.image-resizer.ui");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [lock, setLock] = useState(true);
  const [result, setResult] = useState("");
  const [format, setFormat] = useState<OutputFormat>("png");
  const [quality, setQuality] = useState(90);
  const [fitMode, setFitMode] = useState<FitMode>("stretch");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [resultSize, setResultSize] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    const img = new Image();
    img.onload = () => {
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      setOrigW(img.naturalWidth);
      setOrigH(img.naturalHeight);
    };
    img.src = url;
    setResult("");
  }, []);

  const updateWidth = (w: number) => {
    setWidth(w);
    if (lock && origW) setHeight(Math.round(w * (origH / origW)));
  };

  const updateHeight = (h: number) => {
    setHeight(h);
    if (lock && origH) setWidth(Math.round(h * (origW / origH)));
  };

  const applyPreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
    setLock(false);
  };

  const applyPercentage = (pct: number) => {
    setWidth(Math.round(origW * (pct / 100)));
    setHeight(Math.round(origH * (pct / 100)));
    setLock(true);
  };

  const resize = useCallback(async () => {
    if (!file || !width || !height) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    await new Promise<void>((r) => {
      img.onload = () => r();
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    // Background (for contain mode or JPEG)
    if (fitMode === "contain" || format === "jpeg") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    if (fitMode === "stretch") {
      ctx.drawImage(img, 0, 0, width, height);
    } else if (fitMode === "contain") {
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = width / height;
      let dw: number, dh: number, dx: number, dy: number;
      if (imgAspect > canvasAspect) {
        dw = width;
        dh = Math.round(width / imgAspect);
        dx = 0;
        dy = Math.round((height - dh) / 2);
      } else {
        dh = height;
        dw = Math.round(height * imgAspect);
        dx = Math.round((width - dw) / 2);
        dy = 0;
      }
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      // cover
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = width / height;
      let sx: number, sy: number, sw: number, sh: number;
      if (imgAspect > canvasAspect) {
        sh = img.naturalHeight;
        sw = Math.round(sh * canvasAspect);
        sx = Math.round((img.naturalWidth - sw) / 2);
        sy = 0;
      } else {
        sw = img.naturalWidth;
        sh = Math.round(sw / canvasAspect);
        sx = 0;
        sy = Math.round((img.naturalHeight - sh) / 2);
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
    }

    const qualityVal = format === "png" ? undefined : quality / 100;
    const blob = await new Promise<Blob>((r) =>
      canvas.toBlob((b) => r(b!), getMime(format), qualityVal)
    );
    setResult(URL.createObjectURL(blob));
    setResultSize(blob.size);
    URL.revokeObjectURL(url);
  }, [file, width, height, format, quality, fitMode, bgColor]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) loadImage(e.dataTransfer.files[0]);
          }}
          className="cursor-pointer rounded-xl border-2 border-dashed border-border p-12 text-center transition-colors hover:border-primary/50"
        >
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground">{t("formats")}</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] && loadImage(e.target.files[0])
            }
            className="hidden"
          />
        </div>
      ) : (
        <>
          {/* Info bar */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {t("original")}: {origW}x{origH}
            </span>
            <button
              onClick={() => {
                setFile(null);
                setPreview("");
                setResult("");
              }}
              className="text-sm text-red-400 hover:underline"
            >
              {t("remove")}
            </button>
          </div>

          {/* Dimension inputs */}
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">
                {t("width")}
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => updateWidth(Number(e.target.value))}
                className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={() => setLock(!lock)}
              className={`mb-1 rounded px-2 py-2 text-xs ${lock ? "text-primary" : "text-muted-foreground"}`}
            >
              {lock ? (
                <LinkSimple size={16} weight="bold" />
              ) : (
                <LinkBreak size={16} weight="bold" />
              )}
            </button>
            <div>
              <label className="mb-1 block text-xs font-medium">
                {t("height")}
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => updateHeight(Number(e.target.value))}
                className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={resize}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("resize")}
            </button>
          </div>

          {/* Percentage shortcuts */}
          <div className="flex flex-wrap gap-2">
            {[25, 50, 75, 100, 150, 200].map((pct) => (
              <button
                key={pct}
                onClick={() => applyPercentage(pct)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-primary/30 hover:bg-primary/5"
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Output format + quality + fit mode */}
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium">
                {t("outputFormat")}
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as OutputFormat)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
              </select>
            </div>

            {format !== "png" && (
              <div>
                <label className="mb-1 block text-xs font-medium">
                  {t("quality")}: {quality}%
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-36"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium">
                {t("fitMode")}
              </label>
              <select
                value={fitMode}
                onChange={(e) => setFitMode(e.target.value as FitMode)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="stretch">{t("fitStretch")}</option>
                <option value="contain">{t("fitContain")}</option>
                <option value="cover">{t("fitCover")}</option>
              </select>
            </div>

            {fitMode === "contain" && (
              <div>
                <label className="mb-1 block text-xs font-medium">
                  {t("bgColor")}
                </label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-9 w-14 rounded border border-border cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Presets */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              {t("presets")}
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.w, p.h)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-primary/30 hover:bg-primary/5"
                >
                  {p.label} ({p.w}x{p.h})
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>
                  {width}x{height}px
                </span>
                <span>{format.toUpperCase()}</span>
                <span>{formatSize(resultSize)}</span>
              </div>
              <img
                src={result}
                alt="Resized"
                className="max-h-64 rounded-lg border border-border"
              />
              <a
                href={result}
                download={`${file.name.replace(/\.[^.]+$/, "")}_${width}x${height}.${getExt(format)}`}
                className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {t("download")}
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}

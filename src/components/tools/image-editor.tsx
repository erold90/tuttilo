"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import {
  loadImage,
  canvasToBlob,
  cleanupCanvas,
  formatFileSize,
  triggerDownload,
  revokeUrls,
} from "@/lib/image-utils";

type Tab = "crop" | "resize" | "rotate" | "adjust" | "compress";

const TABS: Tab[] = ["crop", "resize", "rotate", "adjust", "compress"];

const TAB_ICONS: Record<Tab, string> = {
  crop: "\u2702\uFE0F",
  resize: "\uD83D\uDCD0",
  rotate: "\uD83D\uDD04",
  adjust: "\uD83C\uDFA8",
  compress: "\uD83D\uDCE6",
};

interface OutputFmt {
  id: string;
  mime: string;
  ext: string;
  label: string;
  lossy: boolean;
}

const OUTPUT_FMTS: OutputFmt[] = [
  { id: "jpeg", mime: "image/jpeg", ext: "jpg", label: "JPG", lossy: true },
  { id: "png", mime: "image/png", ext: "png", label: "PNG", lossy: false },
  { id: "webp", mime: "image/webp", ext: "webp", label: "WebP", lossy: true },
];

const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml,image/heic,image/heif,image/avif,.heic,.heif";

export function ImageEditor() {
  const t = useTranslations("tools.image-editor.ui");

  // Core state
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [workingBlob, setWorkingBlob] = useState<Blob | null>(null);
  const [workingUrl, setWorkingUrl] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [imgW, setImgW] = useState(0);
  const [imgH, setImgH] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("crop");
  const [opsCount, setOpsCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [history, setHistory] = useState<Blob[]>([]);
  const [showApplied, setShowApplied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Crop state
  const cropperRef = useRef<Cropper>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(NaN);

  // Resize state
  const [resizeW, setResizeW] = useState(0);
  const [resizeH, setResizeH] = useState(0);
  const [lockAR, setLockAR] = useState(true);
  const ratioRef = useRef(1);

  // Adjust state
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  // Compress state
  const [quality, setQuality] = useState(85);
  const [outputFmt, setOutputFmt] = useState("jpeg");
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressedUrl, setCompressedUrl] = useState("");

  // ─── File handling ─────────────────────────────────────────
  async function handleFile(f: File) {
    let blob: Blob = f;
    const ext = f.name.toLowerCase();
    if (ext.endsWith(".heic") || ext.endsWith(".heif") || f.type === "image/heic" || f.type === "image/heif") {
      try {
        const heic2any = (await import("heic2any")).default;
        const result = await heic2any({ blob: f, toType: "image/png", quality: 1 });
        blob = Array.isArray(result) ? result[0] : result;
      } catch {
        setError(t("error"));
        return;
      }
    }
    revokeUrls(workingUrl, compressedUrl);
    setOriginalFile(f);
    setOriginalSize(f.size);
    setWorkingBlob(blob);
    const url = URL.createObjectURL(blob);
    setWorkingUrl(url);
    setError("");
    setHistory([]);
    setOpsCount(0);
    setCompressedSize(0);
    setCompressedUrl("");
    setActiveTab("crop");
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    const img = new Image();
    img.onload = () => {
      setImgW(img.width);
      setImgH(img.height);
      setResizeW(img.width);
      setResizeH(img.height);
      ratioRef.current = img.width / img.height;
    };
    img.src = url;
  }

  // ─── Push result into pipeline ───────────────────────
  function pushResult(newBlob: Blob, w: number, h: number) {
    if (workingBlob) {
      setHistory((prev) => [...prev.slice(-4), workingBlob]);
    }
    revokeUrls(workingUrl, compressedUrl);
    const url = URL.createObjectURL(newBlob);
    setWorkingBlob(newBlob);
    setWorkingUrl(url);
    setImgW(w);
    setImgH(h);
    setResizeW(w);
    setResizeH(h);
    ratioRef.current = w / h;
    setOpsCount((c) => c + 1);
    setCompressedSize(0);
    setCompressedUrl("");
    setShowApplied(true);
    setTimeout(() => setShowApplied(false), 1200);
  }

  function undo() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    revokeUrls(workingUrl, compressedUrl);
    const url = URL.createObjectURL(prev);
    setWorkingBlob(prev);
    setWorkingUrl(url);
    setOpsCount((c) => c - 1);
    setCompressedSize(0);
    setCompressedUrl("");
    const img = new Image();
    img.onload = () => {
      setImgW(img.width);
      setImgH(img.height);
      setResizeW(img.width);
      setResizeH(img.height);
      ratioRef.current = img.width / img.height;
    };
    img.src = url;
  }

  function reset() {
    revokeUrls(workingUrl, compressedUrl);
    setOriginalFile(null);
    setWorkingBlob(null);
    setWorkingUrl("");
    setHistory([]);
    setOpsCount(0);
    setError("");
    setProcessing(false);
    setAspectRatio(NaN);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setQuality(85);
    setCompressedSize(0);
    setCompressedUrl("");
  }

  // ─── Crop ────────────────────────────────────────────
  async function applyCrop() {
    const cropper = (cropperRef.current as any)?.cropper;
    if (!cropper) return;
    setProcessing(true);
    setError("");
    try {
      const canvas = cropper.getCroppedCanvas() as HTMLCanvasElement;
      const blob = await canvasToBlob(canvas, "image/png", 1);
      pushResult(blob, canvas.width, canvas.height);
    } catch {
      setError(t("error"));
    }
    setProcessing(false);
  }

  // ─── Resize ──────────────────────────────────────────
  function updateResizeW(w: number) {
    setResizeW(w);
    if (lockAR) setResizeH(Math.round(w / ratioRef.current));
  }

  function updateResizeH(h: number) {
    setResizeH(h);
    if (lockAR) setResizeW(Math.round(h * ratioRef.current));
  }

  async function applyResize() {
    if (!workingBlob || (resizeW === imgW && resizeH === imgH)) return;
    setProcessing(true);
    setError("");
    try {
      const { img, url: srcUrl } = await loadImage(workingBlob);
      const canvas = document.createElement("canvas");
      canvas.width = resizeW;
      canvas.height = resizeH;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, resizeW, resizeH);
      const blob = await canvasToBlob(canvas, "image/png", 1);
      URL.revokeObjectURL(srcUrl);
      cleanupCanvas(canvas);
      pushResult(blob, resizeW, resizeH);
    } catch {
      setError(t("error"));
    }
    setProcessing(false);
  }

  // ─── Rotate & Flip ────────────────────────────────────
  async function applyRotate(degrees: number) {
    if (!workingBlob) return;
    setProcessing(true);
    setError("");
    try {
      const { img, url: srcUrl } = await loadImage(workingBlob);
      const isRightAngle = degrees === 90 || degrees === -90;
      const canvas = document.createElement("canvas");
      canvas.width = isRightAngle ? img.height : img.width;
      canvas.height = isRightAngle ? img.width : img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      const blob = await canvasToBlob(canvas, "image/png", 1);
      URL.revokeObjectURL(srcUrl);
      cleanupCanvas(canvas);
      pushResult(blob, canvas.width, canvas.height);
    } catch {
      setError(t("error"));
    }
    setProcessing(false);
  }

  async function applyFlip(horizontal: boolean) {
    if (!workingBlob) return;
    setProcessing(true);
    setError("");
    try {
      const { img, url: srcUrl } = await loadImage(workingBlob);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      if (horizontal) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
      }
      ctx.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, "image/png", 1);
      URL.revokeObjectURL(srcUrl);
      cleanupCanvas(canvas);
      pushResult(blob, img.width, img.height);
    } catch {
      setError(t("error"));
    }
    setProcessing(false);
  }

  // ─── Adjust ──────────────────────────────────────────
  async function applyAdjust() {
    if (!workingBlob) return;
    if (brightness === 100 && contrast === 100 && saturation === 100) return;
    setProcessing(true);
    setError("");
    try {
      const { img, url: srcUrl } = await loadImage(workingBlob);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, "image/png", 1);
      URL.revokeObjectURL(srcUrl);
      cleanupCanvas(canvas);
      pushResult(blob, img.width, img.height);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
    } catch {
      setError(t("error"));
    }
    setProcessing(false);
  }

  // ─── Compress ────────────────────────────────────────
  async function compressResult() {
    if (!workingBlob) return;
    setProcessing(true);
    setError("");
    try {
      const { img, url: srcUrl } = await loadImage(workingBlob);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      const fmt = OUTPUT_FMTS.find((f) => f.id === outputFmt)!;
      if (fmt.mime === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      let blob: Blob;
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (fmt.id === "jpeg") {
          const { encode } = await import("@jsquash/jpeg");
          blob = new Blob([await encode(imageData, { quality: quality })], { type: fmt.mime });
        } else if (fmt.id === "webp") {
          const { encode } = await import("@jsquash/webp");
          blob = new Blob([await encode(imageData, { quality: quality })], { type: fmt.mime });
        } else {
          const { encode } = await import("@jsquash/png");
          blob = new Blob([await encode(imageData)], { type: fmt.mime });
        }
      } catch {
        blob = await canvasToBlob(canvas, fmt.mime, quality / 100);
      }

      revokeUrls(compressedUrl);
      setCompressedUrl(URL.createObjectURL(blob));
      setCompressedSize(blob.size);
      cleanupCanvas(canvas);
      URL.revokeObjectURL(srcUrl);
    } catch {
      setError(t("error"));
    }
    setProcessing(false);
  }

  function downloadFinal() {
    if (!originalFile) return;
    const fmt = OUTPUT_FMTS.find((f) => f.id === outputFmt)!;
    const baseName = originalFile.name.replace(/\.[^/.]+$/, "");
    if (compressedUrl) {
      triggerDownload(compressedUrl, `${baseName}-edited.${fmt.ext}`);
    } else if (workingUrl) {
      triggerDownload(workingUrl, `${baseName}-edited.png`);
    }
  }

  // ─── Helpers ─────────────────────────────────────────
  const aspects = [
    { label: t("freeform"), value: NaN },
    { label: "1:1", value: 1 },
    { label: "16:9", value: 16 / 9 },
    { label: "4:3", value: 4 / 3 },
    { label: "3:2", value: 3 / 2 },
  ];

  const currentFmt = OUTPUT_FMTS.find((f) => f.id === outputFmt)!;

  // ==================== DROPZONE ====================
  if (!originalFile) {
    return (
      <div className="space-y-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <p className="text-sm font-medium">{t("dropzone")}</p>
          <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WebP, GIF, BMP, SVG, HEIC, AVIF</p>
        </div>
      </div>
    );
  }

  // ==================== EDITOR ====================
  return (
    <div className="space-y-4">
      {/* Info bar */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-mono text-muted-foreground">{imgW} &times; {imgH}px</span>
        <span className="text-muted-foreground">&middot;</span>
        <span className="text-muted-foreground">{formatFileSize(workingBlob?.size ?? 0)}</span>
        {opsCount > 0 && (
          <>
            <span className="text-muted-foreground">&middot;</span>
            <span className="text-primary font-medium">{opsCount} {t("operationsApplied")}</span>
          </>
        )}
        {showApplied && (
          <span className="text-green-500 text-xs font-medium animate-pulse">{t("applied")}</span>
        )}
      </div>

      {/* Error */}
      {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-border scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-xs">{TAB_ICONS[tab]}</span>
            {t(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
          </button>
        ))}
      </div>

      {/* ──── CROP ──── */}
      {activeTab === "crop" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {aspects.map((a) => (
              <button
                key={a.label}
                onClick={() => {
                  setAspectRatio(a.value);
                  const cropper = (cropperRef.current as any)?.cropper;
                  if (cropper) cropper.setAspectRatio(a.value);
                }}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  (isNaN(aspectRatio) && isNaN(a.value)) || aspectRatio === a.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <Cropper
              key={workingUrl}
              ref={cropperRef as any}
              src={workingUrl}
              style={{ height: 400, width: "100%" }}
              aspectRatio={aspectRatio}
              guides={true}
              viewMode={1}
              responsive={true}
              autoCropArea={0.8}
              background={false}
            />
          </div>
          <button onClick={applyCrop} disabled={processing} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {processing ? t("processing") : t("applyCrop")}
          </button>
        </div>
      )}

      {/* ──── RESIZE ──── */}
      {activeTab === "resize" && (
        <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={workingUrl} alt="Preview" className="max-h-[300px] w-full rounded-lg border border-border object-contain bg-muted/30" />
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">{t("width")}</label>
              <input type="number" value={resizeW} onChange={(e) => updateResizeW(Number(e.target.value))} min={1} max={10000}
                className="w-24 rounded-md border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <button onClick={() => setLockAR(!lockAR)} className={`mb-0.5 rounded-md border p-2 text-xs ${lockAR ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
              {lockAR ? "\uD83D\uDD17" : "\uD83D\uDD13"}
            </button>
            <div>
              <label className="mb-1 block text-xs font-medium">{t("height")}</label>
              <input type="number" value={resizeH} onChange={(e) => updateResizeH(Number(e.target.value))} min={1} max={10000}
                className="w-24 rounded-md border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <span className="mb-1 text-xs text-muted-foreground">px</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[25, 50, 75, 150, 200].map((pct) => (
              <button key={pct} onClick={() => updateResizeW(Math.round(imgW * pct / 100))}
                className="rounded-md border border-border px-3 py-1 text-xs transition-colors hover:bg-muted">
                {pct}%
              </button>
            ))}
          </div>
          <button onClick={applyResize} disabled={processing || (resizeW === imgW && resizeH === imgH)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {processing ? t("processing") : t("applyResize")}
          </button>
        </div>
      )}

      {/* ──── ROTATE & FLIP ──── */}
      {activeTab === "rotate" && (
        <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={workingUrl} alt="Preview" className="max-h-[300px] w-full rounded-lg border border-border object-contain bg-muted/30" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button onClick={() => applyRotate(90)} disabled={processing}
              className="rounded-md border border-border px-3 py-2.5 text-sm hover:bg-muted disabled:opacity-50">
              \u21BB {t("rotateCw")}
            </button>
            <button onClick={() => applyRotate(-90)} disabled={processing}
              className="rounded-md border border-border px-3 py-2.5 text-sm hover:bg-muted disabled:opacity-50">
              \u21BA {t("rotateCcw")}
            </button>
            <button onClick={() => applyFlip(true)} disabled={processing}
              className="rounded-md border border-border px-3 py-2.5 text-sm hover:bg-muted disabled:opacity-50">
              \u2194 {t("flipH")}
            </button>
            <button onClick={() => applyFlip(false)} disabled={processing}
              className="rounded-md border border-border px-3 py-2.5 text-sm hover:bg-muted disabled:opacity-50">
              \u2195 {t("flipV")}
            </button>
          </div>
        </div>
      )}

      {/* ──── ADJUST ──── */}
      {activeTab === "adjust" && (
        <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={workingUrl}
            alt="Preview"
            className="max-h-[300px] w-full rounded-lg border border-border object-contain bg-muted/30"
            style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` }}
          />
          {([
            { label: t("brightness"), value: brightness, set: setBrightness },
            { label: t("contrast"), value: contrast, set: setContrast },
            { label: t("saturation"), value: saturation, set: setSaturation },
          ] as const).map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{s.label}</label>
                <span className="text-sm font-mono text-primary">{s.value}%</span>
              </div>
              <input type="range" min={0} max={200} value={s.value} onChange={(e) => s.set(Number(e.target.value))} className="w-full accent-primary" />
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={applyAdjust} disabled={processing || (brightness === 100 && contrast === 100 && saturation === 100)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {processing ? t("processing") : t("applyAdjust")}
            </button>
            <button onClick={() => { setBrightness(100); setContrast(100); setSaturation(100); }}
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
              {t("resetAdjust")}
            </button>
          </div>
        </div>
      )}

      {/* ──── COMPRESS ──── */}
      {activeTab === "compress" && (
        <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={workingUrl} alt="Preview" className="max-h-[300px] w-full rounded-lg border border-border object-contain bg-muted/30" />

          <div>
            <label className="text-sm font-medium mb-2 block">{t("formatOutput")}</label>
            <div className="flex gap-2">
              {OUTPUT_FMTS.map((fmt) => (
                <button key={fmt.id}
                  onClick={() => { setOutputFmt(fmt.id); setCompressedSize(0); revokeUrls(compressedUrl); setCompressedUrl(""); }}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    outputFmt === fmt.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                  }`}>
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {currentFmt.lossy && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{t("quality")}</label>
                <span className="text-sm font-mono text-primary">{quality}%</span>
              </div>
              <input type="range" min={10} max={100} value={quality}
                onChange={(e) => { setQuality(Number(e.target.value)); setCompressedSize(0); }}
                className="w-full accent-primary" />
            </div>
          )}

          <button onClick={compressResult} disabled={processing}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {processing ? t("processing") : `${t("compress")} \u2192 ${currentFmt.label}`}
          </button>

          {compressedSize > 0 && (
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
                <p className="text-sm font-bold">{formatFileSize(originalSize)}</p>
                <p className="text-xs text-muted-foreground">{t("originalSize")}</p>
              </div>
              <div className="text-muted-foreground text-lg">&rarr;</div>
              <div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
                <p className="text-sm font-bold text-primary">{formatFileSize(compressedSize)}</p>
                <p className="text-xs text-muted-foreground">{t("resultSize")}</p>
              </div>
              {compressedSize < originalSize && (
                <span className="text-xs text-green-500 font-medium">
                  -{Math.round((1 - compressedSize / originalSize) * 100)}%
                </span>
              )}
            </div>
          )}

          {compressedUrl && (
            <button onClick={() => downloadFinal()}
              className="rounded-md bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700">
              {t("download")} .{currentFmt.ext}
            </button>
          )}
        </div>
      )}

      {/* ──── Global actions ──── */}
      <div className="flex flex-wrap gap-3 border-t border-border pt-4">
        {history.length > 0 && (
          <button onClick={undo} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">
            &larr; {t("undo")}
          </button>
        )}
        {activeTab !== "compress" && opsCount > 0 && (
          <button onClick={downloadFinal} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
            {t("download")}
          </button>
        )}
        <button onClick={reset} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">
          {t("reset")}
        </button>
      </div>
    </div>
  );
}

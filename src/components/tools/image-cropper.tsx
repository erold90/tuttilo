"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

const ACCENT = "#06B6D4";
const HANDLE_SIZE = 10;
const MIN_CROP = 20;

const RATIOS = [
  { key: "free", value: 0 },
  { key: "1:1", value: 1 },
  { key: "4:3", value: 4 / 3 },
  { key: "3:2", value: 3 / 2 },
  { key: "16:9", value: 16 / 9 },
  { key: "9:16", value: 9 / 16 },
  { key: "circle", value: -1 },
];

type DragMode =
  | "none"
  | "move"
  | "nw" | "ne" | "sw" | "se"
  | "n" | "s" | "e" | "w";

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function ImageCropper() {
  const t = useTranslations("tools.image-cropper.ui");

  const [file, setFile] = useState<File | null>(null);
  const [ratio, setRatio] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [result, setResult] = useState("");
  const [scale, setScale] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imgUrlRef = useRef("");
  const resultUrlRef = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dragModeRef = useRef<DragMode>("none");
  const dragStartRef = useRef({ px: 0, py: 0, crop: { x: 0, y: 0, w: 0, h: 0 } });

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (imgUrlRef.current) URL.revokeObjectURL(imgUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  // Canvas dimensions (display size, scaled to fit container)
  const getCanvasSize = useCallback(() => {
    const img = imgRef.current;
    if (!img) return { w: 0, h: 0 };
    return { w: Math.round(img.naturalWidth * scale), h: Math.round(img.naturalHeight * scale) };
  }, [scale]);

  // Load image
  const load = useCallback((f: File) => {
    setFile(f);
    if (resultUrlRef.current) { URL.revokeObjectURL(resultUrlRef.current); resultUrlRef.current = ""; }
    setResult("");
    if (imgUrlRef.current) URL.revokeObjectURL(imgUrlRef.current);
    const url = URL.createObjectURL(f);
    imgUrlRef.current = url;

    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const containerW = containerRef.current?.clientWidth ?? 800;
      const maxW = Math.min(img.naturalWidth, containerW);
      const s = maxW / img.naturalWidth;
      setScale(s);
      const cw = Math.round(img.naturalWidth * s * 0.7);
      const ch = Math.round(img.naturalHeight * s * 0.7);
      setCrop({
        x: Math.round((img.naturalWidth * s - cw) / 2),
        y: Math.round((img.naturalHeight * s - ch) / 2),
        w: cw,
        h: ch,
      });
      setRatio(0);
    };
    img.src = url;
  }, []);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const { w, h } = getCanvasSize();
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // Draw full image
    ctx.drawImage(img, 0, 0, w, h);

    // Dim overlay
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, w, h);

    const isCircle = ratio === -1;
    const cx = crop.x, cy = crop.y, cw = crop.w, ch = crop.h;

    // Clear crop region (show bright image)
    if (isCircle) {
      const r = Math.min(cw, ch) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx + cw / 2, cy + ch / 2, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, 0, 0, w, h);
      ctx.restore();
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx, cy, cw, ch);
      ctx.clip();
      ctx.drawImage(img, 0, 0, w, h);
      ctx.restore();
    }

    // Border
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    if (isCircle) {
      const r = Math.min(cw, ch) / 2;
      ctx.beginPath();
      ctx.arc(cx + cw / 2, cy + ch / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(cx, cy, cw, ch);
    }

    // Rule of thirds grid (only for non-circle)
    if (!isCircle && cw > 60 && ch > 60) {
      ctx.strokeStyle = `${ACCENT}40`;
      ctx.lineWidth = 1;
      for (let i = 1; i <= 2; i++) {
        const gx = cx + (cw * i) / 3;
        const gy = cy + (ch * i) / 3;
        ctx.beginPath();
        ctx.moveTo(gx, cy);
        ctx.lineTo(gx, cy + ch);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, gy);
        ctx.lineTo(cx + cw, gy);
        ctx.stroke();
      }
    }

    // Resize handles (corners + edges)
    if (!isCircle) {
      const hs = HANDLE_SIZE;
      const handles = [
        { x: cx - hs / 2, y: cy - hs / 2 },                     // nw
        { x: cx + cw - hs / 2, y: cy - hs / 2 },                // ne
        { x: cx - hs / 2, y: cy + ch - hs / 2 },                // sw
        { x: cx + cw - hs / 2, y: cy + ch - hs / 2 },           // se
        { x: cx + cw / 2 - hs / 2, y: cy - hs / 2 },            // n
        { x: cx + cw / 2 - hs / 2, y: cy + ch - hs / 2 },       // s
        { x: cx - hs / 2, y: cy + ch / 2 - hs / 2 },            // w
        { x: cx + cw - hs / 2, y: cy + ch / 2 - hs / 2 },       // e
      ];
      ctx.fillStyle = ACCENT;
      handles.forEach((hp) => {
        ctx.fillRect(hp.x, hp.y, hs, hs);
      });
    } else {
      // Circle: 4 cardinal handles
      const r = Math.min(cw, ch) / 2;
      const ccx = cx + cw / 2, ccy = cy + ch / 2;
      const hs = HANDLE_SIZE;
      const cardinals = [
        { x: ccx - hs / 2, y: ccy - r - hs / 2 },  // n
        { x: ccx - hs / 2, y: ccy + r - hs / 2 },   // s
        { x: ccx - r - hs / 2, y: ccy - hs / 2 },   // w
        { x: ccx + r - hs / 2, y: ccy - hs / 2 },   // e
      ];
      ctx.fillStyle = ACCENT;
      cardinals.forEach((hp) => {
        ctx.beginPath();
        ctx.arc(hp.x + hs / 2, hp.y + hs / 2, hs / 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Dimensions label
    const realW = Math.round(cw / scale);
    const realH = Math.round(ch / scale);
    const label = `${realW} × ${realH}`;
    ctx.font = "bold 12px system-ui, sans-serif";
    const tw = ctx.measureText(label).width;
    const lx = cx + cw / 2 - tw / 2 - 8;
    const ly = cy + ch + 8;
    if (ly + 22 < h) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.beginPath();
      ctx.roundRect(lx, ly, tw + 16, 22, 6);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText(label, lx + 8, ly + 15);
    } else {
      // Show above if no room below
      const ly2 = cy - 30;
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.beginPath();
      ctx.roundRect(lx, ly2, tw + 16, 22, 6);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText(label, lx + 8, ly2 + 15);
    }
  }, [crop, scale, ratio, getCanvasSize]);

  // Determine drag mode from pointer position
  const getDragMode = useCallback((px: number, py: number): DragMode => {
    const { x, y, w: cw, h: ch } = crop;
    const hs = HANDLE_SIZE * 1.5; // larger hit area
    const isCircle = ratio === -1;

    if (isCircle) {
      const r = Math.min(cw, ch) / 2;
      const ccx = x + cw / 2, ccy = y + ch / 2;
      if (Math.abs(py - (ccy - r)) < hs && Math.abs(px - ccx) < hs) return "n";
      if (Math.abs(py - (ccy + r)) < hs && Math.abs(px - ccx) < hs) return "s";
      if (Math.abs(px - (ccx - r)) < hs && Math.abs(py - ccy) < hs) return "w";
      if (Math.abs(px - (ccx + r)) < hs && Math.abs(py - ccy) < hs) return "e";
      const dist = Math.sqrt((px - ccx) ** 2 + (py - ccy) ** 2);
      if (dist < r) return "move";
      return "none";
    }

    // Corner handles
    if (Math.abs(px - x) < hs && Math.abs(py - y) < hs) return "nw";
    if (Math.abs(px - (x + cw)) < hs && Math.abs(py - y) < hs) return "ne";
    if (Math.abs(px - x) < hs && Math.abs(py - (y + ch)) < hs) return "sw";
    if (Math.abs(px - (x + cw)) < hs && Math.abs(py - (y + ch)) < hs) return "se";
    // Edge handles
    if (Math.abs(py - y) < hs && px > x + hs && px < x + cw - hs) return "n";
    if (Math.abs(py - (y + ch)) < hs && px > x + hs && px < x + cw - hs) return "s";
    if (Math.abs(px - x) < hs && py > y + hs && py < y + ch - hs) return "w";
    if (Math.abs(px - (x + cw)) < hs && py > y + hs && py < y + ch - hs) return "e";
    // Inside crop = move
    if (px > x && px < x + cw && py > y && py < y + ch) return "move";
    return "none";
  }, [crop, ratio]);

  const getCursorForMode = (mode: DragMode): string => {
    const map: Record<DragMode, string> = {
      none: "default", move: "move",
      nw: "nw-resize", ne: "ne-resize", sw: "sw-resize", se: "se-resize",
      n: "n-resize", s: "s-resize", e: "e-resize", w: "w-resize",
    };
    return map[mode];
  };

  // Get pointer coords relative to canvas internal size
  const getPointerPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      px: (e.clientX - rect.left) * (canvas.width / rect.width),
      py: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const { px, py } = getPointerPos(e);
    const mode = getDragMode(px, py);
    if (mode === "none") return;
    dragModeRef.current = mode;
    dragStartRef.current = { px, py, crop: { ...crop } };
    canvasRef.current?.setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [crop, getDragMode, getPointerPos]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const { px, py } = getPointerPos(e);
    const mode = dragModeRef.current;

    // Update cursor
    if (mode === "none") {
      const hover = getDragMode(px, py);
      canvasRef.current!.style.cursor = getCursorForMode(hover);
      return;
    }

    e.preventDefault();
    const { px: sx, py: sy, crop: sc } = dragStartRef.current;
    const dx = px - sx, dy = py - sy;
    const { w: maxW, h: maxH } = getCanvasSize();
    const r = ratio > 0 ? ratio : (ratio === -1 ? 1 : 0);

    setCrop(() => {
      let nx = sc.x, ny = sc.y, nw = sc.w, nh = sc.h;

      if (mode === "move") {
        nx = clamp(sc.x + dx, 0, maxW - sc.w);
        ny = clamp(sc.y + dy, 0, maxH - sc.h);
        return { x: nx, y: ny, w: sc.w, h: sc.h };
      }

      // Resize modes
      if (mode.includes("e")) nw = Math.max(MIN_CROP, sc.w + dx);
      if (mode.includes("w")) { nw = Math.max(MIN_CROP, sc.w - dx); nx = sc.x + sc.w - nw; }
      if (mode.includes("s")) nh = Math.max(MIN_CROP, sc.h + dy);
      if (mode.includes("n")) { nh = Math.max(MIN_CROP, sc.h - dy); ny = sc.y + sc.h - nh; }

      // Enforce ratio
      if (r > 0) {
        if (mode === "n" || mode === "s") {
          nw = Math.round(nh * r);
          nx = sc.x + (sc.w - nw) / 2;
        } else if (mode === "w" || mode === "e") {
          nh = Math.round(nw / r);
          ny = sc.y + (sc.h - nh) / 2;
        } else {
          nh = Math.round(nw / r);
          if (mode.includes("n")) ny = sc.y + sc.h - nh;
        }
      }

      // Clamp to canvas bounds
      nx = clamp(nx, 0, maxW - MIN_CROP);
      ny = clamp(ny, 0, maxH - MIN_CROP);
      nw = clamp(nw, MIN_CROP, maxW - nx);
      nh = clamp(nh, MIN_CROP, maxH - ny);

      return { x: Math.round(nx), y: Math.round(ny), w: Math.round(nw), h: Math.round(nh) };
    });
  }, [getDragMode, getPointerPos, getCanvasSize, ratio]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    dragModeRef.current = "none";
    canvasRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  // Crop action
  const doCrop = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const out = document.createElement("canvas");
    const rw = crop.w / scale, rh = crop.h / scale;
    out.width = Math.round(rw);
    out.height = Math.round(rh);
    const ctx = out.getContext("2d")!;
    if (ratio === -1) {
      ctx.beginPath();
      ctx.arc(rw / 2, rh / 2, Math.min(rw, rh) / 2, 0, Math.PI * 2);
      ctx.clip();
    }
    ctx.drawImage(img, crop.x / scale, crop.y / scale, rw, rh, 0, 0, rw, rh);
    out.toBlob((b) => {
      if (!b) return;
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      const u = URL.createObjectURL(b);
      resultUrlRef.current = u;
      setResult(u);
    }, "image/png");
  }, [crop, scale, ratio]);

  const reset = useCallback(() => {
    if (imgUrlRef.current) { URL.revokeObjectURL(imgUrlRef.current); imgUrlRef.current = ""; }
    if (resultUrlRef.current) { URL.revokeObjectURL(resultUrlRef.current); resultUrlRef.current = ""; }
    setFile(null);
    setResult("");
    imgRef.current = null;
  }, []);

  const changeRatio = useCallback((value: number) => {
    setRatio(value);
    setCrop((c) => {
      if (value === 0) return c;
      const r = value === -1 ? 1 : value;
      const newH = Math.round(c.w / r);
      return { ...c, h: newH };
    });
  }, []);

  return (
    <div ref={containerRef} className="space-y-6">
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); }}
          className="cursor-pointer rounded-xl border-2 border-dashed border-border p-12 text-center transition-colors hover:border-primary/50"
        >
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("formats")}</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && load(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        <>
          {/* Ratio buttons */}
          <div className="flex flex-wrap gap-2">
            {RATIOS.map((r) => (
              <button
                key={r.key}
                onClick={() => changeRatio(r.value)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  ratio === r.value
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                    : "border-border hover:border-border/80 hover:bg-muted/50"
                }`}
              >
                {r.key === "free" ? t("ratioFree") : r.key === "circle" ? t("ratioCircle") : r.key}
              </button>
            ))}
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="max-w-full rounded-lg border border-border touch-none"
          />

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={doCrop}
              className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
            >
              {t("crop")}
            </button>
            <button
              onClick={reset}
              className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted transition-colors"
            >
              {t("reset")}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="space-y-3 rounded-xl border border-border p-4">
              <img
                src={result}
                alt="Cropped"
                className="max-h-72 rounded-lg"
              />
              <div className="flex items-center gap-3">
                <a
                  href={result}
                  download="cropped.png"
                  className="inline-block rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
                >
                  {t("download")}
                </a>
                <span className="text-xs text-muted-foreground">
                  {Math.round(crop.w / scale)} × {Math.round(crop.h / scale)} px
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

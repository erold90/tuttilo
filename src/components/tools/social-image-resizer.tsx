"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

const PRESETS = [
  { name: "Instagram Post", w: 1080, h: 1080, platform: "instagram" },
  { name: "Instagram Story", w: 1080, h: 1920, platform: "instagram" },
  { name: "Instagram Landscape", w: 1080, h: 566, platform: "instagram" },
  { name: "Facebook Post", w: 1200, h: 630, platform: "facebook" },
  { name: "Facebook Cover", w: 820, h: 312, platform: "facebook" },
  { name: "Twitter Post", w: 1200, h: 675, platform: "twitter" },
  { name: "Twitter Header", w: 1500, h: 500, platform: "twitter" },
  { name: "LinkedIn Post", w: 1200, h: 627, platform: "linkedin" },
  { name: "LinkedIn Cover", w: 1584, h: 396, platform: "linkedin" },
  { name: "YouTube Thumbnail", w: 1280, h: 720, platform: "youtube" },
  { name: "Pinterest Pin", w: 1000, h: 1500, platform: "pinterest" },
  { name: "TikTok Video", w: 1080, h: 1920, platform: "tiktok" },
];

export default function SocialImageResizer() {
  const t = useTranslations("tools.social-image-resizer");
  const [image, setImage] = useState<string | null>(null);
  const [preset, setPreset] = useState(PRESETS[0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const download = useCallback(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = preset.w;
    canvas.height = preset.h;
    const img = new Image();
    img.onload = () => {
      // Cover fit
      const scale = Math.max(preset.w / img.width, preset.h / img.height);
      const sw = preset.w / scale;
      const sh = preset.h / scale;
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, preset.w, preset.h);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${preset.name.toLowerCase().replace(/\s+/g, "-")}-${preset.w}x${preset.h}.png`;
      a.click();
    };
    img.src = image;
  }, [image, preset]);

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-8 text-center">
        {image ? (
          <div className="space-y-2">
            <img src={image} alt="Preview" className="max-h-48 mx-auto rounded" />
            <button onClick={() => setImage(null)} className="text-sm text-red-500 hover:underline">{t("ui.remove")}</button>
          </div>
        ) : (
          <label className="cursor-pointer text-sm text-zinc-500">
            {t("ui.dropOrClick")}
            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </label>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t("ui.selectSize")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {PRESETS.map(p => (
            <button key={p.name} onClick={() => setPreset(p)} className={`p-2 rounded-lg text-left text-sm border ${preset.name === p.name ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{p.name}</span>
              <span className="block text-xs text-zinc-500">{p.w} × {p.h}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-700 rounded-lg">
          <p className="text-sm text-zinc-500">{t("ui.selected")}: <strong>{preset.name}</strong> ({preset.w} × {preset.h})</p>
        </div>
        <button onClick={download} disabled={!image} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">{t("ui.download")}</button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

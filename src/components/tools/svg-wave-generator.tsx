"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

function generateWavePath(width: number, height: number, waves: number, amplitude: number, seed: number): string {
  const points: [number, number][] = [];
  const segments = waves * 2 + 1;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const y = height / 2 + Math.sin((i / segments) * Math.PI * waves + seed) * amplitude;
    points.push([x, y]);
  }
  let d = `M 0 ${height} L ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i];
    const [px, py] = points[i - 1];
    const cpx1 = px + (x - px) / 3;
    const cpx2 = px + (2 * (x - px)) / 3;
    d += ` C ${cpx1} ${py} ${cpx2} ${y} ${x} ${y}`;
  }
  d += ` L ${width} ${height} Z`;
  return d;
}

export default function SvgWaveGenerator() {
  const t = useTranslations("tools.svg-wave-generator");
  const [color1, setColor1] = useState("#4F46E5");
  const [color2, setColor2] = useState("#7C3AED");
  const [waves, setWaves] = useState(3);
  const [amplitude, setAmplitude] = useState(40);
  const [layers, setLayers] = useState(3);
  const [height, setHeight] = useState(200);
  const [flip, setFlip] = useState(false);

  const svgContent = useMemo(() => {
    const w = 1440;
    const layerPaths: string[] = [];
    for (let i = 0; i < layers; i++) {
      const a = amplitude * (1 - i * 0.2);
      const seed = i * 2.1;
      const opacity = 1 - i * (0.6 / layers);
      const path = generateWavePath(w, height, waves + i * 0.5, a, seed);
      layerPaths.push(`<path d="${path}" fill="${color1}" opacity="${opacity.toFixed(2)}"/>`);
    }
    const transform = flip ? `transform="scale(1,-1) translate(0,-${height})"` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${height}" ${transform} preserveAspectRatio="none">
  <defs><linearGradient id="wg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${color1}"/><stop offset="100%" stop-color="${color2}"/></linearGradient></defs>
  <rect width="${w}" height="${height}" fill="url(#wg)"/>
  ${layerPaths.join("\n  ")}
</svg>`;
  }, [color1, color2, waves, amplitude, layers, height, flip]);

  const download = useCallback(() => {
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "wave.svg"; a.click();
    URL.revokeObjectURL(url);
  }, [svgContent]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(svgContent);
  }, [svgContent]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.color1")}
          <input type="color" value={color1} onChange={e => setColor1(e.target.value)} className="mt-1 w-full h-9 rounded border border-zinc-300 dark:border-zinc-600 cursor-pointer" />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.color2")}
          <input type="color" value={color2} onChange={e => setColor2(e.target.value)} className="mt-1 w-full h-9 rounded border border-zinc-300 dark:border-zinc-600 cursor-pointer" />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.waves")}
          <input type="range" min={1} max={8} value={waves} onChange={e => setWaves(+e.target.value)} className="mt-2 w-full" />
          <span className="text-xs text-zinc-500">{waves}</span>
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.amplitude")}
          <input type="range" min={10} max={100} value={amplitude} onChange={e => setAmplitude(+e.target.value)} className="mt-2 w-full" />
          <span className="text-xs text-zinc-500">{amplitude}px</span>
        </label>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.layers")}:
          <input type="number" min={1} max={5} value={layers} onChange={e => setLayers(Math.max(1, Math.min(5, +e.target.value)))} className="ml-2 w-16 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.height")}:
          <input type="number" min={50} max={500} value={height} onChange={e => setHeight(Math.max(50, +e.target.value))} className="ml-2 w-20 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" checked={flip} onChange={e => setFlip(e.target.checked)} className="accent-blue-600" />
          {t("ui.flip")}
        </label>
      </div>
      <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700" dangerouslySetInnerHTML={{ __html: svgContent }} />
      <div className="flex gap-3">
        <button onClick={download} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.downloadSvg")}</button>
        <button onClick={copyCode} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 text-sm">{t("ui.copyCode")}</button>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

const PATTERNS = [
  "212222","222122","222221","121223","121322","131222","122213","122312",
  "132212","221213","221312","231212","112232","122132","122231","113222",
  "123122","123221","223211","221132","221231","213212","223112","312131",
  "311222","321122","321221","312212","322112","322211","212123","212321",
  "232121","111323","131123","131321","112313","132113","132311","211313",
  "231113","231311","112133","112331","132131","113123","113321","133121",
  "313121","211331","231131","213113","213311","213131","311123","311321",
  "331121","312113","312311","332111","314111","221411","431111","111224",
  "111422","121124","121421","141122","141221","112214","112412","122114",
  "122411","142112","142211","241211","221114","413111","241112","134111",
  "111242","121142","121241","114212","124112","124211","411212","421112",
  "421211","212141","214121","412121","111143","111341","131141","114113",
  "114311","411113","411311","113141","114131","311141","411131",
  "211412","211214","211232"
];
const STOP = "2331112";
const START_B = 104;

function encodeCode128B(text: string): number[] {
  const values: number[] = [START_B];
  for (let i = 0; i < text.length; i++) {
    const v = text.charCodeAt(i) - 32;
    values.push(v >= 0 && v <= 95 ? v : 0);
  }
  let checksum = START_B;
  for (let i = 1; i < values.length; i++) checksum += i * values[i];
  values.push(checksum % 103);
  return values;
}

export default function BarcodeGenerator() {
  const t = useTranslations("tools.barcode-generator");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("Hello World");
  const [barWidth, setBarWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [showText, setShowText] = useState(true);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const values = encodeCode128B(text);
    let totalModules = 20; // quiet zones
    for (const v of values) for (const c of PATTERNS[v]) totalModules += +c;
    for (const c of STOP) totalModules += +c;

    const w = totalModules * barWidth;
    const textH = showText ? 24 : 0;
    canvas.width = w;
    canvas.height = height + textH;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, height + textH);

    let x = 10 * barWidth;
    const allPatterns = [...values.map(v => PATTERNS[v]), STOP];
    for (const pattern of allPatterns) {
      for (let i = 0; i < pattern.length; i++) {
        const bw = +pattern[i] * barWidth;
        if (i % 2 === 0) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(x, 0, bw, height);
        }
        x += bw;
      }
    }

    if (showText) {
      ctx.fillStyle = "#000000";
      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.fillText(text, w / 2, height + 18);
    }
  }, [text, barWidth, height, showText]);

  useEffect(() => { draw(); }, [draw]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a"); a.href = url; a.download = "barcode.png"; a.click();
  }, []);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {t("ui.text")}
        <input type="text" value={text} onChange={e => setText(e.target.value)} maxLength={80} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
      </label>
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.barWidth")}:
          <input type="number" min={1} max={5} value={barWidth} onChange={e => setBarWidth(Math.max(1, +e.target.value))} className="ml-2 w-16 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.height")}:
          <input type="number" min={30} max={300} value={height} onChange={e => setHeight(Math.max(30, +e.target.value))} className="ml-2 w-20 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" checked={showText} onChange={e => setShowText(e.target.checked)} className="accent-blue-600" />
          {t("ui.showText")}
        </label>
      </div>
      <div className="overflow-x-auto bg-white p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <canvas ref={canvasRef} className="mx-auto" />
      </div>
      <button onClick={download} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.download")}</button>
    </div>
  );
}

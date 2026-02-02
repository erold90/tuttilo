"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

interface TextInfo {
  idx: number;
  str: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  ascent: number;
  descent: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  vw: number;
  vh: number;
}

interface TextAnnotation {
  text: string;
  pdfX: number;
  pdfY: number;
  fontSize: number;
  page: number;
}

interface DrawStroke {
  points: { pdfX: number; pdfY: number }[];
  width: number;
  color: string;
  page: number;
}

let pdfjsReady: typeof import("pdfjs-dist") | null = null;
async function getPdfjs() {
  if (pdfjsReady) return pdfjsReady;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
  pdfjsReady = lib;
  return lib;
}

export function PdfEditor() {
  const t = useTranslations("tools.pdf-editor.ui");

  const [file, setFile] = useState<File | null>(null);
  const [rawBytes, setRawBytes] = useState<ArrayBuffer | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");

  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [textItems, setTextItems] = useState<TextInfo[]>([]);
  const [mode, setMode] = useState<"select" | "text" | "draw">("select");

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [editedSizes, setEditedSizes] = useState<Record<string, number>>({});

  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [newTextInput, setNewTextInput] = useState("");
  const [newTextPos, setNewTextPos] = useState<{ x: number; y: number } | null>(null);
  const [newTextSize, setNewTextSize] = useState(14);

  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<DrawStroke | null>(null);
  const [penWidth, setPenWidth] = useState(2);
  const [penColor, setPenColor] = useState("#000000");

  const previewRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const pageDimsRef = useRef({ w: 612, h: 792 });
  const isDrawingRef = useRef(false);

  /* ---------- load ---------- */

  const loadFile = useCallback(
    async (f: File) => {
      if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return;
      setError("");
      setResultUrl("");
      setFile(f);
      const bytes = await f.arrayBuffer();
      setRawBytes(bytes);
      try {
        const pdfjs = await getPdfjs();
        const doc = await pdfjs.getDocument({ data: bytes }).promise;
        setPageCount(doc.numPages);
        doc.destroy();
      } catch {
        setError(t("error"));
        return;
      }
      setCurrentPage(1);
    },
    [t]
  );

  /* ---------- extract text ---------- */

  const extractText = useCallback(
    async (pageNum: number, viewportScale: number) => {
      if (!rawBytes) return;
      const pdfjs = await getPdfjs();
      const doc = await pdfjs.getDocument({ data: rawBytes }).promise;
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: viewportScale });

      // Need getOperatorList for font data
      await page.getOperatorList();

      const tc = await page.getTextContent();
      const items: TextInfo[] = [];

      for (let i = 0; i < tc.items.length; i++) {
        const item = tc.items[i];
        if (!("str" in item) || !item.str.trim()) continue;

        const style = tc.styles[item.fontName] || {
          fontFamily: "sans-serif",
          ascent: 0.8,
          descent: -0.2,
        };
        const [a, b, c, d, tx, ty] = item.transform;
        const fontSize = b === 0 && c === 0 ? Math.abs(d) : Math.sqrt(a * a + b * b);
        const ascent = isNaN(style.ascent) ? 0.8 : style.ascent;
        const descent = isNaN(style.descent) ? -0.2 : style.descent;

        let isBold = false;
        let isItalic = false;
        try {
          const fontObj = page.commonObjs.get(item.fontName);
          if (fontObj?.name) {
            isBold = /bold/i.test(fontObj.name);
            isItalic = /italic|oblique/i.test(fontObj.name);
          }
        } catch {}

        // Canvas coordinates via viewport
        const [vx, vy] = viewport.convertToViewportPoint(tx, ty);
        const canvasFontH = fontSize * viewportScale;
        const topY = vy - canvasFontH * ascent;
        const fullH = canvasFontH * (ascent + Math.abs(descent));

        items.push({
          idx: i,
          str: item.str,
          x: tx,
          y: ty,
          fontSize,
          fontFamily: style.fontFamily,
          isBold,
          isItalic,
          ascent,
          descent,
          width: item.width,
          height: item.height,
          vx,
          vy: topY,
          vw: item.width * viewportScale,
          vh: fullH,
        });
      }

      setTextItems(items);
      doc.destroy();
    },
    [rawBytes]
  );

  /* ---------- render preview ---------- */

  const renderPreview = useCallback(async () => {
    if (!rawBytes || !previewRef.current) return;
    const canvas = previewRef.current;
    const pdfjs = await getPdfjs();
    const doc = await pdfjs.getDocument({ data: rawBytes }).promise;
    const page = await doc.getPage(currentPage);
    const containerW = wrapperRef.current?.clientWidth ?? 600;
    const vp = page.getViewport({ scale: 1 });
    const scale = Math.min((containerW - 16) / vp.width, 1.5);
    scaleRef.current = scale;
    pageDimsRef.current = { w: vp.width, h: vp.height };
    const svp = page.getViewport({ scale });

    canvas.width = svp.width;
    canvas.height = svp.height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await (
      page.render({
        canvasContext: ctx,
        viewport: svp,
        canvas,
      } as Parameters<typeof page.render>[0]
    ).promise);

    // Size overlay to match
    if (overlayRef.current) {
      overlayRef.current.width = canvas.width;
      overlayRef.current.height = canvas.height;
      overlayRef.current.style.width = canvas.style.width || `${canvas.width}px`;
      overlayRef.current.style.height = canvas.style.height || `${canvas.height}px`;
    }

    doc.destroy();
    await extractText(currentPage, scale);
  }, [rawBytes, currentPage, extractText]);

  useEffect(() => {
    if (rawBytes && !resultUrl) renderPreview();
  }, [rawBytes, currentPage, renderPreview, resultUrl]);

  /* ---------- render overlay ---------- */

  const renderOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = scaleRef.current;

    // Highlight edited text items
    for (const item of textItems) {
      const key = `${currentPage}-${item.idx}`;
      const isEdited = key in editedTexts;
      const isSelected = selectedIdx === item.idx;

      if (isSelected) {
        ctx.fillStyle = "rgba(99, 102, 241, 0.2)";
        ctx.strokeStyle = "#6366F1";
        ctx.lineWidth = 2;
        ctx.fillRect(item.vx, item.vy, item.vw, item.vh);
        ctx.strokeRect(item.vx, item.vy, item.vw, item.vh);
      } else if (isEdited) {
        ctx.fillStyle = "rgba(34, 197, 94, 0.15)";
        ctx.fillRect(item.vx, item.vy, item.vw, item.vh);
      }
    }

    // Draw new text annotation markers
    for (const ann of textAnnotations) {
      if (ann.page !== currentPage) continue;
      const [cx, cy] = [ann.pdfX * scale, (pageDimsRef.current.h - ann.pdfY) * scale];
      ctx.fillStyle = "rgba(99, 102, 241, 0.3)";
      ctx.fillRect(cx - 2, cy - ann.fontSize * scale, ctx.measureText(ann.text).width + 4, ann.fontSize * scale + 4);
      ctx.fillStyle = "#6366F1";
      ctx.font = `${ann.fontSize * scale}px sans-serif`;
      ctx.fillText(ann.text, cx, cy);
    }

    // Draw pending text cursor
    if (mode === "text" && newTextPos) {
      ctx.strokeStyle = "#6366F1";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      const cy = (pageDimsRef.current.h - newTextPos.y) * scale;
      ctx.beginPath();
      ctx.moveTo(newTextPos.x * scale, cy - newTextSize * scale);
      ctx.lineTo(newTextPos.x * scale, cy + 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw strokes for current page
    const pageStrokes = strokes.filter((s) => s.page === currentPage);
    for (const stroke of pageStrokes) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width * scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 0; i < stroke.points.length; i++) {
        const cx = stroke.points[i].pdfX * scale;
        const cy = (pageDimsRef.current.h - stroke.points[i].pdfY) * scale;
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    // Active stroke
    if (activeStroke && activeStroke.points.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = activeStroke.color;
      ctx.lineWidth = activeStroke.width * scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 0; i < activeStroke.points.length; i++) {
        const cx = activeStroke.points[i].pdfX * scale;
        const cy = (pageDimsRef.current.h - activeStroke.points[i].pdfY) * scale;
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }
  }, [textItems, selectedIdx, editedTexts, currentPage, strokes, activeStroke, textAnnotations, mode, newTextPos, newTextSize]);

  useEffect(() => {
    renderOverlay();
  }, [renderOverlay]);

  /* ---------- event handlers ---------- */

  const canvasToPdf = useCallback((clientX: number, clientY: number) => {
    const rect = overlayRef.current!.getBoundingClientRect();
    const cx = clientX - rect.left;
    const cy = clientY - rect.top;
    return {
      pdfX: cx / scaleRef.current,
      pdfY: pageDimsRef.current.h - cy / scaleRef.current,
    };
  }, []);

  const onOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (mode === "draw") return;
      const rect = overlayRef.current!.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      if (mode === "select") {
        let found: TextInfo | null = null;
        for (const item of textItems) {
          if (cx >= item.vx && cx <= item.vx + item.vw && cy >= item.vy && cy <= item.vy + item.vh) {
            found = item;
            break;
          }
        }
        if (found) {
          setSelectedIdx(found.idx);
          const key = `${currentPage}-${found.idx}`;
          if (!(key in editedTexts)) {
            setEditedTexts((prev) => ({ ...prev, [key]: found!.str }));
            setEditedSizes((prev) => ({ ...prev, [key]: found!.fontSize }));
          }
        } else {
          setSelectedIdx(null);
        }
      } else if (mode === "text") {
        const { pdfX, pdfY } = canvasToPdf(e.clientX, e.clientY);
        setNewTextPos({ x: pdfX, y: pdfY });
        setNewTextInput("");
      }
    },
    [mode, textItems, currentPage, editedTexts, canvasToPdf]
  );

  const onDrawStart = useCallback(
    (e: React.MouseEvent) => {
      if (mode !== "draw") return;
      isDrawingRef.current = true;
      const { pdfX, pdfY } = canvasToPdf(e.clientX, e.clientY);
      setActiveStroke({
        points: [{ pdfX, pdfY }],
        width: penWidth,
        color: penColor,
        page: currentPage,
      });
    },
    [mode, penWidth, penColor, currentPage, canvasToPdf]
  );

  const onDrawMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawingRef.current || mode !== "draw") return;
      const { pdfX, pdfY } = canvasToPdf(e.clientX, e.clientY);
      setActiveStroke((prev) =>
        prev ? { ...prev, points: [...prev.points, { pdfX, pdfY }] } : prev
      );
    },
    [mode, canvasToPdf]
  );

  const onDrawEnd = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    setActiveStroke((prev) => {
      if (prev && prev.points.length >= 2) {
        setStrokes((s) => [...s, prev]);
      }
      return null;
    });
  }, []);

  const addTextAnnotation = useCallback(() => {
    if (!newTextPos || !newTextInput.trim()) return;
    setTextAnnotations((prev) => [
      ...prev,
      {
        text: newTextInput,
        pdfX: newTextPos.x,
        pdfY: newTextPos.y,
        fontSize: newTextSize,
        page: currentPage,
      },
    ]);
    setNewTextPos(null);
    setNewTextInput("");
  }, [newTextPos, newTextInput, newTextSize, currentPage]);

  const undoLast = useCallback(() => {
    if (mode === "draw") {
      setStrokes((s) => s.slice(0, -1));
    } else if (mode === "text") {
      setTextAnnotations((a) => a.slice(0, -1));
    }
  }, [mode]);

  /* ---------- apply ---------- */

  const apply = useCallback(async () => {
    if (!rawBytes || !file) return;
    setProcessing(true);
    setError("");
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const pdfLib = await import("@pdf-lib/fontkit");
      let doc: Awaited<ReturnType<typeof PDFDocument.load>>;
      try {
        doc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
      } catch {
        doc = await PDFDocument.create();
        const pdfjs = await getPdfjs();
        const src = await pdfjs.getDocument({ data: rawBytes }).promise;
        for (let i = 1; i <= src.numPages; i++) {
          const pg = await src.getPage(i);
          const vp = pg.getViewport({ scale: 2 });
          const c = document.createElement("canvas");
          c.width = vp.width;
          c.height = vp.height;
          const ctx = c.getContext("2d")!;
          await (pg.render({ canvasContext: ctx, viewport: vp, canvas: c } as Parameters<typeof pg.render>[0]).promise);
          const blob = await new Promise<Blob>((r) => c.toBlob((b) => r(b!), "image/jpeg", 0.92));
          const img = await doc.embedJpg(await blob.arrayBuffer());
          const origVp = pg.getViewport({ scale: 1 });
          doc.addPage([origVp.width, origVp.height]).drawImage(img, { x: 0, y: 0, width: origVp.width, height: origVp.height });
          c.width = 0;
          c.height = 0;
        }
        src.destroy();
      }

      doc.registerFontkit(pdfLib.default);

      // Embed standard fonts
      const fonts: Record<string, Awaited<ReturnType<typeof doc.embedFont>>> = {
        "sans-serif": await doc.embedFont(StandardFonts.Helvetica),
        "sans-serif-bold": await doc.embedFont(StandardFonts.HelveticaBold),
        "sans-serif-italic": await doc.embedFont(StandardFonts.HelveticaOblique),
        "sans-serif-bolditalic": await doc.embedFont(StandardFonts.HelveticaBoldOblique),
        serif: await doc.embedFont(StandardFonts.TimesRoman),
        "serif-bold": await doc.embedFont(StandardFonts.TimesRomanBold),
        "serif-italic": await doc.embedFont(StandardFonts.TimesRomanItalic),
        "serif-bolditalic": await doc.embedFont(StandardFonts.TimesRomanBoldItalic),
        monospace: await doc.embedFont(StandardFonts.Courier),
        "monospace-bold": await doc.embedFont(StandardFonts.CourierBold),
        "monospace-italic": await doc.embedFont(StandardFonts.CourierOblique),
        "monospace-bolditalic": await doc.embedFont(StandardFonts.CourierBoldOblique),
      };

      function pickFont(family: string, bold: boolean, italic: boolean) {
        const base = family === "serif" ? "serif" : family === "monospace" ? "monospace" : "sans-serif";
        const suffix = bold && italic ? "-bolditalic" : bold ? "-bold" : italic ? "-italic" : "";
        return fonts[base + suffix] || fonts["sans-serif"];
      }

      // Re-extract text for each page that has edits
      const editedPages = new Set<number>();
      for (const key of Object.keys(editedTexts)) {
        const pg = parseInt(key.split("-")[0]);
        editedPages.add(pg);
      }
      for (const ann of textAnnotations) editedPages.add(ann.page);
      for (const s of strokes) editedPages.add(s.page);

      for (const pageNum of editedPages) {
        const page = doc.getPage(pageNum - 1);
        const { width: pw, height: ph } = page.getSize();

        // Re-extract text items for this page
        const pdfjs = await getPdfjs();
        const srcDoc = await pdfjs.getDocument({ data: rawBytes }).promise;
        const srcPage = await srcDoc.getPage(pageNum);
        const tc = await srcPage.getTextContent();

        // Apply text edits
        for (let i = 0; i < tc.items.length; i++) {
          const item = tc.items[i];
          if (!("str" in item) || !item.str.trim()) continue;
          const key = `${pageNum}-${i}`;
          if (!(key in editedTexts)) continue;

          const newText = editedTexts[key];
          const style = tc.styles[item.fontName] || { fontFamily: "sans-serif", ascent: 0.8, descent: -0.2 };
          const [a, b, c, d, tx, ty] = item.transform;
          const origFontSize = b === 0 && c === 0 ? Math.abs(d) : Math.sqrt(a * a + b * b);
          const newFontSize = editedSizes[key] ?? origFontSize;
          const ascent = isNaN(style.ascent) ? 0.8 : style.ascent;
          const descent = isNaN(style.descent) ? -0.2 : style.descent;

          let isBold = false;
          let isItalic = false;
          try {
            await srcPage.getOperatorList();
            const fontObj = srcPage.commonObjs.get(item.fontName);
            if (fontObj?.name) {
              isBold = /bold/i.test(fontObj.name);
              isItalic = /italic|oblique/i.test(fontObj.name);
            }
          } catch {}

          const font = pickFont(style.fontFamily, isBold, isItalic);

          // White rectangle to cover original text
          const pad = 2;
          const origW = item.width;
          const newW = font.widthOfTextAtSize(newText, newFontSize);
          const rectW = Math.max(origW, newW) + pad * 2;
          const rectH = origFontSize * (ascent + Math.abs(descent)) + pad * 2;
          const rectX = tx - pad;
          const rectY = ty + descent * origFontSize - pad;

          page.drawRectangle({
            x: rectX,
            y: rectY,
            width: rectW,
            height: rectH,
            color: rgb(1, 1, 1),
            borderWidth: 0,
          });

          // Draw new text at baseline
          page.drawText(newText, {
            x: tx,
            y: ty,
            size: newFontSize,
            font,
            color: rgb(0, 0, 0),
          });
        }

        // New text annotations
        for (const ann of textAnnotations) {
          if (ann.page !== pageNum) continue;
          const font = fonts["sans-serif"];
          page.drawText(ann.text, {
            x: ann.pdfX,
            y: ann.pdfY,
            size: ann.fontSize,
            font,
            color: rgb(0, 0, 0),
          });
        }

        // Drawing strokes: render to transparent canvas → embed as image
        const pageStrokes = strokes.filter((s) => s.page === pageNum);
        if (pageStrokes.length > 0) {
          const dpr = 2;
          const drawCanvas = document.createElement("canvas");
          drawCanvas.width = pw * dpr;
          drawCanvas.height = ph * dpr;
          const dctx = drawCanvas.getContext("2d")!;
          dctx.scale(dpr, dpr);

          for (const stroke of pageStrokes) {
            if (stroke.points.length < 2) continue;
            dctx.beginPath();
            dctx.strokeStyle = stroke.color;
            dctx.lineWidth = stroke.width;
            dctx.lineCap = "round";
            dctx.lineJoin = "round";
            for (let j = 0; j < stroke.points.length; j++) {
              const cx = stroke.points[j].pdfX;
              const cy = ph - stroke.points[j].pdfY;
              if (j === 0) dctx.moveTo(cx, cy);
              else dctx.lineTo(cx, cy);
            }
            dctx.stroke();
          }

          const drawBlob = await new Promise<Blob>((r) => drawCanvas.toBlob((b) => r(b!), "image/png"));
          const drawImg = await doc.embedPng(await drawBlob.arrayBuffer());
          page.drawImage(drawImg, { x: 0, y: 0, width: pw, height: ph });
          drawCanvas.width = 0;
          drawCanvas.height = 0;
        }

        srcDoc.destroy();
      }

      const saved = await doc.save();
      const blob = new Blob([saved.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  }, [rawBytes, file, editedTexts, editedSizes, textAnnotations, strokes, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.pdf$/i, "-edited.pdf");
    a.click();
  }, [resultUrl, file]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setRawBytes(null);
    setResultUrl("");
    setError("");
    setPageCount(0);
    setCurrentPage(1);
    setTextItems([]);
    setSelectedIdx(null);
    setEditedTexts({});
    setEditedSizes({});
    setTextAnnotations([]);
    setStrokes([]);
    setNewTextPos(null);
    setNewTextInput("");
  }, [resultUrl]);

  const hasChanges =
    Object.keys(editedTexts).some((k) => {
      const item = textItems.find((ti) => `${currentPage}-${ti.idx}` === k);
      return item ? editedTexts[k] !== item.str : true;
    }) ||
    textAnnotations.length > 0 ||
    strokes.length > 0;

  const selectedItem = selectedIdx !== null ? textItems.find((ti) => ti.idx === selectedIdx) : null;
  const selectedKey = selectedItem ? `${currentPage}-${selectedItem.idx}` : null;

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("border-primary");
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove("border-primary");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("border-primary");
            if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
          }}
          onClick={() => {
            const i = document.createElement("input");
            i.type = "file";
            i.accept = ".pdf";
            i.onchange = () => i.files?.[0] && loadFile(i.files[0]);
            i.click();
          }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        >
          <div className="text-4xl mb-3">📄</div>
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : resultUrl ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 space-y-4">
          <div className="text-center">
            <div className="text-3xl mb-2">✓</div>
            <p className="font-medium">{t("done")}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={download}
              className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
              {t("download")}
            </button>
            <button
              onClick={reset}
              className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80"
            >
              {t("reset")}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* File info */}
          <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
            <p className="font-medium truncate text-sm">{file.name}</p>
            <button
              onClick={reset}
              className="text-xs text-muted-foreground hover:text-foreground ml-2 shrink-0"
            >
              ✕
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {(["select", "text", "draw"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setSelectedIdx(null);
                    setNewTextPos(null);
                  }}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === m ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                >
                  {t(
                    `mode${m.charAt(0).toUpperCase() + m.slice(1)}` as
                      | "modeSelect"
                      | "modeText"
                      | "modeDraw"
                  )}
                </button>
              ))}
            </div>

            {mode === "draw" && (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={penColor}
                  onChange={(e) => setPenColor(e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer"
                />
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={penWidth}
                  onChange={(e) => setPenWidth(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-xs text-muted-foreground">{penWidth}px</span>
              </div>
            )}

            <button
              onClick={undoLast}
              disabled={(mode === "draw" ? strokes.length === 0 : textAnnotations.length === 0)}
              className="px-3 py-1.5 bg-muted rounded-lg text-sm hover:bg-muted/80 disabled:opacity-40"
            >
              {t("undo")}
            </button>
          </div>

          {/* Hint */}
          <p className="text-xs text-muted-foreground">
            {mode === "select" && t("selectHint")}
            {mode === "text" && t("textHint")}
            {mode === "draw" && t("drawHint")}
          </p>

          {/* Preview + Overlay */}
          <div ref={wrapperRef}>
            <div className="bg-muted/30 rounded-lg p-2 flex justify-center overflow-hidden">
              <div className="relative inline-block">
                <canvas
                  ref={previewRef}
                  className="shadow-lg rounded"
                  style={{ maxWidth: "100%", maxHeight: "600px", display: "block" }}
                />
                <canvas
                  ref={overlayRef}
                  className="absolute left-0 top-0"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "600px",
                    cursor:
                      mode === "select" ? "text" : mode === "draw" ? "crosshair" : "crosshair",
                  }}
                  onClick={mode !== "draw" ? onOverlayClick : undefined}
                  onMouseDown={mode === "draw" ? onDrawStart : undefined}
                  onMouseMove={mode === "draw" ? onDrawMove : undefined}
                  onMouseUp={mode === "draw" ? onDrawEnd : undefined}
                  onMouseLeave={mode === "draw" ? onDrawEnd : undefined}
                />
              </div>
            </div>
            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    setSelectedIdx(null);
                  }}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-40 text-sm"
                >
                  {t("prev")}
                </button>
                <span className="text-sm text-muted-foreground">
                  {t("page")} {currentPage} {t("of")} {pageCount}
                </span>
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(pageCount, p + 1));
                    setSelectedIdx(null);
                  }}
                  disabled={currentPage >= pageCount}
                  className="px-3 py-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-40 text-sm"
                >
                  {t("next")}
                </button>
              </div>
            )}
          </div>

          {/* Edit panel (select mode) */}
          {mode === "select" && selectedItem && selectedKey && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{t("fontDetected")}:</span>
                <span className="font-mono bg-background px-2 py-0.5 rounded">
                  {selectedItem.fontFamily}
                  {selectedItem.isBold ? " Bold" : ""}
                  {selectedItem.isItalic ? " Italic" : ""}
                </span>
                <span>{Math.round(selectedItem.fontSize)}pt</span>
              </div>
              <input
                type="text"
                value={editedTexts[selectedKey] ?? selectedItem.str}
                onChange={(e) =>
                  setEditedTexts((prev) => ({ ...prev, [selectedKey]: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                placeholder={t("editPlaceholder")}
                autoFocus
              />
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground">{t("fontSize")}:</label>
                <input
                  type="number"
                  min={6}
                  max={72}
                  value={Math.round(editedSizes[selectedKey] ?? selectedItem.fontSize)}
                  onChange={(e) =>
                    setEditedSizes((prev) => ({
                      ...prev,
                      [selectedKey]: Number(e.target.value),
                    }))
                  }
                  className="w-20 px-2 py-1 rounded border bg-background text-sm"
                />
                <button
                  onClick={() => setSelectedIdx(null)}
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("cancelEdit")}
                </button>
              </div>
            </div>
          )}

          {/* Add text panel */}
          {mode === "text" && newTextPos && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <input
                type="text"
                value={newTextInput}
                onChange={(e) => setNewTextInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                placeholder={t("editPlaceholder")}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && addTextAnnotation()}
              />
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground">{t("fontSize")}:</label>
                <input
                  type="number"
                  min={6}
                  max={72}
                  value={newTextSize}
                  onChange={(e) => setNewTextSize(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded border bg-background text-sm"
                />
                <button
                  onClick={addTextAnnotation}
                  disabled={!newTextInput.trim()}
                  className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {t("addText")}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
          )}

          <button
            onClick={apply}
            disabled={processing || !hasChanges}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {processing ? t("processing") : t("apply")}
          </button>
        </>
      )}
    </div>
  );
}

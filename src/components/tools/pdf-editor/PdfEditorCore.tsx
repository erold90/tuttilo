"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Cursor as CursorIcon,
  TextT,
  PencilSimple,
  Image as ImageIcon,
  ListBullets,
  Signature,
  ArrowCounterClockwise,
  ArrowClockwise,
  X as XIcon,
  Info,
  CaretLeft,
  CaretRight,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  FloppyDisk,
  Upload,
} from "@phosphor-icons/react";
import type {
  TextInfo,
  TextAnnotation,
  DrawStroke,
  ImageAnnotation as ImageAnnotationType,
  EditorMode,
  EditorAction,
  PdfEditorProps,
  FieldInfo,
  SignPos,
} from "./types";
import { getPdfjs, hexToRgb, canvasToPdf, uid } from "./utils";
import { useEditorHistory } from "./useEditorHistory";
import { InlineTextEditor } from "./InlineTextEditor";
import { FloatingToolbar } from "./FloatingToolbar";
import { DraggableAnnotation } from "./DraggableAnnotation";
import { ImageAnnotationEl } from "./ImageAnnotation";
import { SafariPdfBanner } from "@/components/safari-pdf-banner";

const MODE_ICONS: Record<EditorMode, React.ElementType> = {
  select: CursorIcon,
  text: TextT,
  draw: PencilSimple,
  image: ImageIcon,
  fill: ListBullets,
  sign: Signature,
};

export function PdfEditorCore({ file, rawBytes, onReset }: PdfEditorProps) {
  const t = useTranslations("tools.pdf-editor.ui");
  const history = useEditorHistory();

  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");

  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const [textItems, setTextItems] = useState<TextInfo[]>([]);
  const [mode, setMode] = useState<EditorMode>("select");

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [editedSizes, setEditedSizes] = useState<Record<string, number>>({});
  const [editedColors, setEditedColors] = useState<Record<string, string>>({});
  const [inlineEditing, setInlineEditing] = useState(false);

  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [newTextInput, setNewTextInput] = useState("");
  const [newTextPos, setNewTextPos] = useState<{ x: number; y: number } | null>(null);
  const [newTextSize, setNewTextSize] = useState(14);
  const [newTextColor, setNewTextColor] = useState("#000000");

  const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotationType[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{ dataUrl: string; w: number; h: number } | null>(null);

  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<DrawStroke | null>(null);
  const [penWidth, setPenWidth] = useState(2);
  const [penColor, setPenColor] = useState("#000000");

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [, forceRender] = useState(0);

  // Fill & Sign state
  const [fields, setFields] = useState<FieldInfo[]>([]);
  const [textVals, setTextVals] = useState<Record<string, string>>({});
  const [checkVals, setCheckVals] = useState<Record<string, boolean>>({});
  const [flatten, setFlatten] = useState(false);

  const [signMode, setSignMode] = useState<"draw" | "type" | "upload">("draw");
  const [signDataUrl, setSignDataUrl] = useState("");
  const [typedName, setTypedName] = useState("");
  const [signPos, setSignPos] = useState<SignPos | null>(null);
  const [signAspect, setSignAspect] = useState(2.5);
  const [signSize, setSignSize] = useState(200);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const signImgRef = useRef<HTMLImageElement | null>(null);

  const previewRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const signCanvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<any>(null);
  const scaleRef = useRef(1);
  const pageDimsRef = useRef({ w: 612, h: 792 });
  const isDrawingRef = useRef(false);

  /* ---------- undo/redo ---------- */

  const applyAction = useCallback(
    (action: EditorAction, reverse: boolean) => {
      switch (action.type) {
        case "editText": {
          const text = reverse ? action.oldText : action.newText;
          setEditedTexts((prev) => ({ ...prev, [action.key]: text }));
          break;
        }
        case "editSize": {
          const size = reverse ? action.oldSize : action.newSize;
          setEditedSizes((prev) => ({ ...prev, [action.key]: size }));
          break;
        }
        case "addAnnotation":
          if (reverse) setTextAnnotations((a) => a.filter((x) => x.id !== action.annotation.id));
          else setTextAnnotations((a) => [...a, action.annotation]);
          break;
        case "removeAnnotation":
          if (reverse) setTextAnnotations((a) => [...a, action.annotation]);
          else setTextAnnotations((a) => a.filter((x) => x.id !== action.id));
          break;
        case "moveAnnotation":
          setTextAnnotations((a) =>
            a.map((x) =>
              x.id === action.id
                ? { ...x, pdfX: reverse ? action.oldX : action.newX, pdfY: reverse ? action.oldY : action.newY }
                : x
            )
          );
          break;
        case "addStroke":
          if (reverse) setStrokes((s) => s.slice(0, -1));
          else setStrokes((s) => [...s, action.stroke]);
          break;
        case "removeStroke":
          if (reverse) setStrokes((s) => { const n = [...s]; n.splice(action.index, 0, action.stroke); return n; });
          else setStrokes((s) => s.filter((_, i) => i !== action.index));
          break;
        case "addImage":
          if (reverse) setImageAnnotations((a) => a.filter((x) => x.id !== action.image.id));
          else setImageAnnotations((a) => [...a, action.image]);
          break;
        case "removeImage":
          if (reverse) setImageAnnotations((a) => [...a, action.image]);
          else setImageAnnotations((a) => a.filter((x) => x.id !== action.id));
          break;
        case "moveImage":
          setImageAnnotations((a) =>
            a.map((x) =>
              x.id === action.id
                ? { ...x, pdfX: reverse ? action.oldX : action.newX, pdfY: reverse ? action.oldY : action.newY }
                : x
            )
          );
          break;
        case "resizeImage":
          setImageAnnotations((a) =>
            a.map((x) =>
              x.id === action.id
                ? { ...x, width: reverse ? action.oldW : action.newW, height: reverse ? action.oldH : action.newH }
                : x
            )
          );
          break;
      }
    },
    []
  );

  const doUndo = useCallback(() => {
    const action = history.undo();
    if (action) applyAction(action, true);
    forceRender((n) => n + 1);
  }, [history, applyAction]);

  const doRedo = useCallback(() => {
    const action = history.redo();
    if (action) applyAction(action, false);
    forceRender((n) => n + 1);
  }, [history, applyAction]);

  /* ---------- keyboard shortcuts ---------- */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "z" && !e.shiftKey) { e.preventDefault(); doUndo(); }
      if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); doRedo(); }
      if (e.key === "Escape") {
        setSelectedIdx(null);
        setSelectedAnnotationId(null);
        setSelectedImageId(null);
        setInlineEditing(false);
        setNewTextPos(null);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && !inlineEditing) {
        if (selectedAnnotationId) {
          e.preventDefault();
          const ann = textAnnotations.find((a) => a.id === selectedAnnotationId);
          if (ann) {
            history.push({ type: "removeAnnotation", id: ann.id, annotation: ann });
            setTextAnnotations((a) => a.filter((x) => x.id !== ann.id));
            setSelectedAnnotationId(null);
          }
        }
        if (selectedImageId) {
          e.preventDefault();
          const img = imageAnnotations.find((a) => a.id === selectedImageId);
          if (img) {
            history.push({ type: "removeImage", id: img.id, image: img });
            setImageAnnotations((a) => a.filter((x) => x.id !== img.id));
            setSelectedImageId(null);
          }
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [doUndo, doRedo, selectedAnnotationId, selectedImageId, textAnnotations, imageAnnotations, history, inlineEditing]);

  /* ---------- init + detect form fields ---------- */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Page count via pdfjs
      try {
        const pdfjs = await getPdfjs();
        const doc = await pdfjs.getDocument({ data: rawBytes.slice(0) }).promise;
        if (!cancelled) setPageCount(doc.numPages);
        doc.destroy();
      } catch (err) {
        console.error("PdfEditor init error:", err);
        if (!cancelled) setError(t("error"));
        return;
      }
      // Detect form fields via pdf-lib
      try {
        const { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown } = await import("pdf-lib");
        const doc = await PDFDocument.load(rawBytes.slice(0), { ignoreEncryption: true });
        if (cancelled) return;
        try {
          const form = doc.getForm();
          const allFields = form.getFields();
          const detected: FieldInfo[] = [];
          const tv: Record<string, string> = {};
          const cv: Record<string, boolean> = {};
          for (const field of allFields) {
            const name = field.getName();
            if (field instanceof PDFTextField) {
              detected.push({ name, type: "text" });
              const val = field.getText() ?? "";
              if (val) tv[name] = val;
            } else if (field instanceof PDFCheckBox) {
              detected.push({ name, type: "checkbox" });
              cv[name] = field.isChecked();
            } else if (field instanceof PDFDropdown) {
              const opts = field.getOptions() ?? [];
              detected.push({ name, type: "dropdown", options: opts });
              const sel = field.getSelected()?.[0] ?? "";
              if (sel) tv[name] = sel;
            }
          }
          if (!cancelled) {
            setFields(detected);
            setTextVals(tv);
            setCheckVals(cv);
          }
        } catch { /* No form fields */ }
      } catch { /* pdf-lib can't parse - no form fields */ }
    })();
    return () => { cancelled = true; };
  }, [rawBytes, t]);

  /* ---------- extract text ---------- */

  const extractText = useCallback(
    async (pageNum: number, viewportScale: number) => {
      const pdfjs = await getPdfjs();
      const doc = await pdfjs.getDocument({ data: rawBytes.slice(0) }).promise;
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: viewportScale });

      await page.getOperatorList();
      const tc = await page.getTextContent();
      const items: TextInfo[] = [];

      for (let i = 0; i < tc.items.length; i++) {
        const item = tc.items[i];
        if (!("str" in item) || !item.str.trim()) continue;

        const style = tc.styles[item.fontName] || { fontFamily: "sans-serif", ascent: 0.8, descent: -0.2 };
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

        const [vx, vy] = viewport.convertToViewportPoint(tx, ty);
        const canvasFontH = fontSize * viewportScale;
        const topY = vy - canvasFontH * ascent;
        const fullH = canvasFontH * (ascent + Math.abs(descent));

        items.push({
          idx: i, str: item.str, x: tx, y: ty,
          fontSize, fontFamily: style.fontFamily, isBold, isItalic,
          ascent, descent, width: item.width, height: item.height,
          vx, vy: topY, vw: item.width * viewportScale, vh: fullH,
        });
      }

      setTextItems(items);
      doc.destroy();
    },
    [rawBytes]
  );

  /* ---------- render preview ---------- */

  const renderPreview = useCallback(async () => {
    if (!previewRef.current || pageCount === 0) return;
    const canvas = previewRef.current;
    const pdfjs = await getPdfjs();
    const doc = await pdfjs.getDocument({ data: rawBytes.slice(0) }).promise;
    const page = await doc.getPage(currentPage);

    const containerW = wrapperRef.current?.clientWidth ?? 700;
    const vp = page.getViewport({ scale: 1 });
    let baseScale = (containerW - 32) / vp.width;
    if (vp.height * baseScale > 800) baseScale = 800 / vp.height;
    baseScale = Math.min(baseScale, 2);
    const scale = baseScale * zoom;

    scaleRef.current = scale;
    pageDimsRef.current = { w: vp.width, h: vp.height };
    const svp = page.getViewport({ scale });
    const w = Math.round(svp.width);
    const h = Math.round(svp.height);

    canvas.width = w;
    canvas.height = h;
    if (overlayRef.current) {
      overlayRef.current.width = w;
      overlayRef.current.height = h;
    }
    setDims({ w, h });

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    await page.render({ canvasContext: ctx, viewport: svp, canvas } as Parameters<typeof page.render>[0]).promise;
    doc.destroy();

    try { await extractText(currentPage, scale); } catch (err) {
      console.warn("PdfEditor extractText failed:", err);
    }
  }, [rawBytes, currentPage, pageCount, extractText, zoom]);

  useEffect(() => {
    if (pageCount > 0 && !resultUrl) {
      renderPreview().catch((err) => {
        console.error("PdfEditor renderPreview error:", err);
        setError(`${t("error")} — ${err instanceof Error ? err.message : String(err)}`);
      });
    }
  }, [pageCount, currentPage, renderPreview, resultUrl, t]);

  /* ---------- render overlay ---------- */

  const renderOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas || dims.w === 0) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = scaleRef.current;

    // Always render edited text replacements (regardless of current mode)
    for (const item of textItems) {
      const key = `${currentPage}-${item.idx}`;
      const isEdited = key in editedTexts && editedTexts[key] !== item.str;
      const w = Math.max(item.vw, 20);

      if (isEdited && !(mode === "select" && selectedIdx === item.idx)) {
        // LIVE PREVIEW: white rect over original text + draw new text
        const editedSize = editedSizes[key] ?? item.fontSize;
        const scaledFs = editedSize * scale;
        const fontFamily = item.fontFamily === "serif" ? "serif" : item.fontFamily === "monospace" ? "monospace" : "sans-serif";
        const fontWeight = item.isBold ? "bold" : "normal";
        const fontStyle = item.isItalic ? "italic" : "normal";

        // White rect to cover original text
        ctx.fillStyle = "#ffffff";
        const pad = 2;
        ctx.fillRect(item.vx - pad, item.vy - pad, w + pad * 2 + 60, item.vh + pad * 2);

        // Draw new text
        ctx.font = `${fontStyle} ${fontWeight} ${scaledFs}px ${fontFamily}`;
        const editedColor = editedColors[key] ?? "#000000";
        ctx.fillStyle = editedColor;
        const baseline = item.vy + item.vh * (item.ascent / (item.ascent + Math.abs(item.descent)));
        ctx.fillText(editedTexts[key], item.vx, baseline);

        // Green indicator border
        const newW = ctx.measureText(editedTexts[key]).width;
        ctx.strokeStyle = "rgba(34, 197, 94, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(item.vx - 1, item.vy - 1, Math.max(newW, w) + 2, item.vh + 2);
      }
    }

    // Select mode: show interactive highlights for non-edited items
    if (mode === "select") {
      for (const item of textItems) {
        const key = `${currentPage}-${item.idx}`;
        const isEdited = key in editedTexts && editedTexts[key] !== item.str;
        const isSelected = selectedIdx === item.idx;
        const isHovered = hoverIdx === item.idx && !isSelected;
        const w = Math.max(item.vw, 20);

        if (isSelected && inlineEditing) {
          ctx.strokeStyle = "#6366F1";
          ctx.lineWidth = 2;
          ctx.strokeRect(item.vx, item.vy, w, item.vh);
        } else if (isSelected) {
          ctx.fillStyle = "rgba(99, 102, 241, 0.25)";
          ctx.strokeStyle = "#6366F1";
          ctx.lineWidth = 2;
          ctx.fillRect(item.vx, item.vy, w, item.vh);
          ctx.strokeRect(item.vx, item.vy, w, item.vh);
        } else if (!isEdited && isHovered) {
          ctx.strokeStyle = "rgba(59, 130, 246, 0.5)";
          ctx.lineWidth = 1;
          ctx.strokeRect(item.vx, item.vy, w, item.vh);
        } else if (!isEdited) {
          ctx.fillStyle = "rgba(99, 102, 241, 0.05)";
          ctx.fillRect(item.vx, item.vy, w, item.vh);
        }
      }
    }

    // Real-time text preview for text mode
    if (mode === "text" && newTextPos) {
      const cx = newTextPos.x * scale;
      const cy = (pageDimsRef.current.h - newTextPos.y) * scale;
      if (newTextInput) {
        ctx.font = `${newTextSize * scale}px sans-serif`;
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = newTextColor;
        ctx.fillText(newTextInput, cx, cy);
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = "#6366F1";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - newTextSize * scale);
      ctx.lineTo(cx, cy + 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Image placement cursor
    if (mode === "image" && pendingImage) {
      ctx.strokeStyle = "#6366F1";
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 60, 60);
      ctx.setLineDash([]);
    }

    // Committed strokes
    for (const stroke of strokes) {
      if (stroke.page !== currentPage || stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width * scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 0; i < stroke.points.length; i++) {
        const px = stroke.points[i].pdfX * scale;
        const py = (pageDimsRef.current.h - stroke.points[i].pdfY) * scale;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
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
        const px = activeStroke.points[i].pdfX * scale;
        const py = (pageDimsRef.current.h - activeStroke.points[i].pdfY) * scale;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Signature preview
    if (signPos?.page === currentPage && signImgRef.current) {
      const simg = signImgRef.current;
      const sw = signSize * scale;
      const sh = sw / signAspect;
      const sx = signPos.xRatio * canvas.width - sw / 2;
      const sy = signPos.yRatio * canvas.height - sh / 2;
      ctx.drawImage(simg, sx, sy, sw, sh);
      ctx.strokeStyle = "#6366F1";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(sx, sy, sw, sh);
      ctx.setLineDash([]);
    }
  }, [textItems, selectedIdx, hoverIdx, editedTexts, editedSizes, editedColors, inlineEditing, currentPage, strokes, activeStroke, mode, newTextPos, newTextSize, newTextInput, newTextColor, dims, pendingImage, signPos, signDataUrl, signSize, signAspect]);

  useEffect(() => { renderOverlay(); }, [renderOverlay]);

  /* ---------- hover tracking ---------- */

  const onOverlayMove = useCallback(
    (e: React.PointerEvent) => {
      if (mode !== "select" || isDrawingRef.current) return;
      const canvas = overlayRef.current;
      if (!canvas) return;
      const { cx, cy } = canvasToPdf(e.clientX, e.clientY, canvas, scaleRef.current, pageDimsRef.current.h);
      let found: number | null = null;
      for (const item of textItems) {
        const w = Math.max(item.vw, 20);
        if (cx >= item.vx && cx <= item.vx + w && cy >= item.vy && cy <= item.vy + item.vh) {
          found = item.idx;
          break;
        }
      }
      setHoverIdx(found);
    },
    [mode, textItems]
  );

  /* ---------- event handlers ---------- */

  const onOverlayClick = useCallback(
    (e: React.PointerEvent) => {
      if (mode === "draw") return;
      const canvas = overlayRef.current;
      if (!canvas) return;
      const { cx, cy, pdfX, pdfY } = canvasToPdf(e.clientX, e.clientY, canvas, scaleRef.current, pageDimsRef.current.h);

      // Deselect annotations/images when clicking canvas
      setSelectedAnnotationId(null);
      setSelectedImageId(null);

      if (mode === "select") {
        let found: TextInfo | null = null;
        for (const item of textItems) {
          const w = Math.max(item.vw, 20);
          if (cx >= item.vx && cx <= item.vx + w && cy >= item.vy && cy <= item.vy + item.vh) {
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
          setInlineEditing(true);
        } else {
          setSelectedIdx(null);
          setInlineEditing(false);
        }
      } else if (mode === "text") {
        setNewTextPos({ x: pdfX, y: pdfY });
        setNewTextInput("");
      } else if (mode === "image" && pendingImage) {
        const imgAnn: ImageAnnotationType = {
          id: uid(),
          dataUrl: pendingImage.dataUrl,
          pdfX,
          pdfY,
          width: pendingImage.w,
          height: pendingImage.h,
          page: currentPage,
          naturalW: pendingImage.w,
          naturalH: pendingImage.h,
        };
        history.push({ type: "addImage", image: imgAnn });
        setImageAnnotations((a) => [...a, imgAnn]);
        setPendingImage(null);
      } else if (mode === "sign" && signDataUrl) {
        const rect = canvas.getBoundingClientRect();
        setSignPos({
          page: currentPage,
          xRatio: (e.clientX - rect.left) / rect.width,
          yRatio: (e.clientY - rect.top) / rect.height,
        });
      }
    },
    [mode, textItems, currentPage, editedTexts, pendingImage, history, signDataUrl]
  );

  const onDrawStart = useCallback(
    (e: React.PointerEvent) => {
      if (mode !== "draw") return;
      isDrawingRef.current = true;
      const canvas = overlayRef.current;
      if (!canvas) return;
      const { pdfX, pdfY } = canvasToPdf(e.clientX, e.clientY, canvas, scaleRef.current, pageDimsRef.current.h);
      setActiveStroke({ points: [{ pdfX, pdfY }], width: penWidth, color: penColor, page: currentPage });
    },
    [mode, penWidth, penColor, currentPage]
  );

  const onDrawMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingRef.current || mode !== "draw") return;
      const canvas = overlayRef.current;
      if (!canvas) return;
      const { pdfX, pdfY } = canvasToPdf(e.clientX, e.clientY, canvas, scaleRef.current, pageDimsRef.current.h);
      setActiveStroke((prev) => prev ? { ...prev, points: [...prev.points, { pdfX, pdfY }] } : prev);
    },
    [mode]
  );

  const onDrawEnd = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    setActiveStroke((prev) => {
      if (prev && prev.points.length >= 2) {
        history.push({ type: "addStroke", stroke: prev });
        setStrokes((s) => [...s, prev]);
      }
      return null;
    });
  }, [history]);

  const addTextAnnotation = useCallback(() => {
    if (!newTextPos || !newTextInput.trim()) return;
    const ann: TextAnnotation = {
      id: uid(),
      text: newTextInput,
      pdfX: newTextPos.x,
      pdfY: newTextPos.y,
      fontSize: newTextSize,
      color: newTextColor,
      page: currentPage,
    };
    history.push({ type: "addAnnotation", annotation: ann });
    setTextAnnotations((prev) => [...prev, ann]);
    setNewTextPos(null);
    setNewTextInput("");
  }, [newTextPos, newTextInput, newTextSize, newTextColor, currentPage, history]);

  /* ---------- image upload ---------- */

  const onImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          // Scale down if too large (max 200pt in PDF units)
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          const maxDim = 200;
          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          setPendingImage({ dataUrl: reader.result as string, w, h });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(f);
    };
    input.click();
  }, []);

  /* ---------- signature pad ---------- */

  useEffect(() => {
    if (mode !== "sign" || signMode !== "draw" || !signCanvasRef.current) return;
    let cancelled = false;
    import("signature_pad").then(({ default: SP }) => {
      if (cancelled || !signCanvasRef.current) return;
      const c = signCanvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      const rect = c.getBoundingClientRect();
      c.width = rect.width * dpr;
      c.height = rect.height * dpr;
      const ctx = c.getContext("2d")!;
      ctx.scale(dpr, dpr);
      padRef.current = new SP(c, {
        backgroundColor: "rgba(255,255,255,0)",
        penColor: "#000",
        minWidth: 1,
        maxWidth: 3,
      });
    });
    return () => {
      cancelled = true;
      padRef.current?.off();
      padRef.current = null;
    };
  }, [mode, signMode]);

  // Preload signature image for overlay rendering
  useEffect(() => {
    if (!signDataUrl) { signImgRef.current = null; return; }
    const img = new Image();
    img.onload = () => { signImgRef.current = img; renderOverlay(); };
    img.src = signDataUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signDataUrl]);

  const saveDrawnSig = useCallback(() => {
    if (!padRef.current || padRef.current.isEmpty()) return;
    const url = padRef.current.toDataURL("image/png");
    setSignDataUrl(url);
    const img = new Image();
    img.onload = () => { if (img.naturalWidth > 0) setSignAspect(img.naturalWidth / img.naturalHeight); };
    img.src = url;
  }, []);

  const clearSig = useCallback(() => {
    padRef.current?.clear();
    setSignDataUrl("");
    setSignPos(null);
  }, []);

  const genTypedSig = useCallback(() => {
    if (!typedName.trim()) return;
    const c = document.createElement("canvas");
    c.width = 600; c.height = 200;
    const ctx = c.getContext("2d")!;
    ctx.font = "italic 64px Georgia, 'Times New Roman', serif";
    ctx.fillStyle = "#000";
    ctx.textBaseline = "middle";
    const metrics = ctx.measureText(typedName);
    c.width = Math.max(Math.ceil(metrics.width) + 32, 200);
    ctx.font = "italic 64px Georgia, 'Times New Roman', serif";
    ctx.fillStyle = "#000";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName, 16, 100);
    const url = c.toDataURL("image/png");
    setSignDataUrl(url);
    setSignAspect(c.width / c.height);
  }, [typedName]);

  const uploadSig = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setSignDataUrl(url);
      const img = new Image();
      img.onload = () => { if (img.naturalWidth > 0) setSignAspect(img.naturalWidth / img.naturalHeight); };
      img.src = url;
    };
    reader.readAsDataURL(f);
  }, []);

  /* ---------- annotation handlers ---------- */

  const onAnnotationMove = useCallback(
    (id: string, pdfX: number, pdfY: number) => {
      const ann = textAnnotations.find((a) => a.id === id);
      if (ann) {
        history.push({ type: "moveAnnotation", id, oldX: ann.pdfX, oldY: ann.pdfY, newX: pdfX, newY: pdfY });
        setTextAnnotations((a) => a.map((x) => (x.id === id ? { ...x, pdfX, pdfY } : x)));
      }
    },
    [textAnnotations, history]
  );

  const onAnnotationEdit = useCallback((id: string, text: string) => {
    setTextAnnotations((a) => a.map((x) => (x.id === id ? { ...x, text } : x)));
  }, []);

  const onAnnotationSizeChange = useCallback((id: string, size: number) => {
    setTextAnnotations((a) => a.map((x) => (x.id === id ? { ...x, fontSize: size } : x)));
  }, []);

  const onImageMove = useCallback(
    (id: string, pdfX: number, pdfY: number) => {
      const img = imageAnnotations.find((a) => a.id === id);
      if (img) {
        history.push({ type: "moveImage", id, oldX: img.pdfX, oldY: img.pdfY, newX: pdfX, newY: pdfY });
        setImageAnnotations((a) => a.map((x) => (x.id === id ? { ...x, pdfX, pdfY } : x)));
      }
    },
    [imageAnnotations, history]
  );

  const onImageResize = useCallback(
    (id: string, width: number, height: number) => {
      const img = imageAnnotations.find((a) => a.id === id);
      if (img) {
        history.push({ type: "resizeImage", id, oldW: img.width, oldH: img.height, newW: width, newH: height });
        setImageAnnotations((a) => a.map((x) => (x.id === id ? { ...x, width, height } : x)));
      }
    },
    [imageAnnotations, history]
  );

  /* ---------- inline text editing handlers ---------- */

  const onInlineTextChange = useCallback(
    (text: string) => {
      if (selectedIdx === null) return;
      const key = `${currentPage}-${selectedIdx}`;
      const oldText = editedTexts[key] ?? textItems.find((ti) => ti.idx === selectedIdx)?.str ?? "";
      setEditedTexts((prev) => ({ ...prev, [key]: text }));
      // We push to history on close, not on every keystroke
    },
    [selectedIdx, currentPage, editedTexts, textItems]
  );

  const onInlineSizeChange = useCallback(
    (size: number) => {
      if (selectedIdx === null) return;
      const key = `${currentPage}-${selectedIdx}`;
      setEditedSizes((prev) => ({ ...prev, [key]: size }));
    },
    [selectedIdx, currentPage]
  );

  const onInlineColorChange = useCallback(
    (color: string) => {
      if (selectedIdx === null) return;
      const key = `${currentPage}-${selectedIdx}`;
      setEditedColors((prev) => ({ ...prev, [key]: color }));
    },
    [selectedIdx, currentPage]
  );

  const onInlineClose = useCallback(() => {
    if (selectedIdx === null) return;
    const key = `${currentPage}-${selectedIdx}`;
    const item = textItems.find((ti) => ti.idx === selectedIdx);
    const newText = editedTexts[key] ?? item?.str ?? "";
    const oldText = item?.str ?? "";
    if (newText !== oldText) {
      history.push({ type: "editText", key, oldText, newText });
    }
    setInlineEditing(false);
    // Keep selectedIdx so highlight remains until clicking elsewhere
  }, [selectedIdx, currentPage, editedTexts, textItems, history]);

  /* ---------- apply / save ---------- */

  const apply = useCallback(async () => {
    if (!rawBytes) return;
    setProcessing(true);
    setError("");
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const pdfLib = await import("@pdf-lib/fontkit");
      let doc: Awaited<ReturnType<typeof PDFDocument.load>>;
      try {
        doc = await PDFDocument.load(rawBytes.slice(0), { ignoreEncryption: true });
      } catch {
        doc = await PDFDocument.create();
        const pdfjs = await getPdfjs();
        const src = await pdfjs.getDocument({ data: rawBytes.slice(0) }).promise;
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
          c.width = 0; c.height = 0;
        }
        src.destroy();
      }

      doc.registerFontkit(pdfLib.default);

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

      const editedPages = new Set<number>();
      for (const key of Object.keys(editedTexts)) editedPages.add(parseInt(key.split("-")[0]));
      for (const ann of textAnnotations) editedPages.add(ann.page);
      for (const s of strokes) editedPages.add(s.page);
      for (const img of imageAnnotations) editedPages.add(img.page);

      for (const pageNum of editedPages) {
        const page = doc.getPage(pageNum - 1);
        const { width: pw, height: ph } = page.getSize();

        const pdfjs = await getPdfjs();
        const srcDoc = await pdfjs.getDocument({ data: rawBytes.slice(0) }).promise;
        const srcPage = await srcDoc.getPage(pageNum);
        const tc = await srcPage.getTextContent();

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

          let isBold = false, isItalic = false;
          try {
            await srcPage.getOperatorList();
            const fontObj = srcPage.commonObjs.get(item.fontName);
            if (fontObj?.name) {
              isBold = /bold/i.test(fontObj.name);
              isItalic = /italic|oblique/i.test(fontObj.name);
            }
          } catch {}

          const font = pickFont(style.fontFamily, isBold, isItalic);
          const pad = 2;
          const origW = item.width;
          const newW = font.widthOfTextAtSize(newText, newFontSize);
          const rectW = Math.max(origW, newW) + pad * 2;
          const rectH = origFontSize * (ascent + Math.abs(descent)) + pad * 2;
          const rectX = tx - pad;
          const rectY = ty + descent * origFontSize - pad;

          page.drawRectangle({ x: rectX, y: rectY, width: rectW, height: rectH, color: rgb(1, 1, 1), borderWidth: 0 });

          const textColor = editedColors[key];
          const { r: cr, g: cg, b: cb } = textColor ? hexToRgb(textColor) : { r: 0, g: 0, b: 0 };
          page.drawText(newText, { x: tx, y: ty, size: newFontSize, font, color: rgb(cr, cg, cb) });
        }

        for (const ann of textAnnotations) {
          if (ann.page !== pageNum) continue;
          const font = fonts["sans-serif"];
          const { r, g, b: bl } = hexToRgb(ann.color || "#000000");
          page.drawText(ann.text, { x: ann.pdfX, y: ann.pdfY, size: ann.fontSize, font, color: rgb(r, g, bl) });
        }

        // Drawing strokes
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
              if (j === 0) dctx.moveTo(cx, cy); else dctx.lineTo(cx, cy);
            }
            dctx.stroke();
          }
          const drawBlob = await new Promise<Blob>((r) => drawCanvas.toBlob((b) => r(b!), "image/png"));
          const drawImg = await doc.embedPng(await drawBlob.arrayBuffer());
          page.drawImage(drawImg, { x: 0, y: 0, width: pw, height: ph });
          drawCanvas.width = 0; drawCanvas.height = 0;
        }

        // Image annotations
        const pageImages = imageAnnotations.filter((im) => im.page === pageNum);
        for (const imgAnn of pageImages) {
          const dataUrl = imgAnn.dataUrl;
          const res = await fetch(dataUrl);
          const arrBuf = await res.arrayBuffer();
          const isPng = dataUrl.includes("image/png");
          const embeddedImg = isPng ? await doc.embedPng(arrBuf) : await doc.embedJpg(arrBuf);
          page.drawImage(embeddedImg, {
            x: imgAnn.pdfX,
            y: imgAnn.pdfY - imgAnn.height,
            width: imgAnn.width,
            height: imgAnn.height,
          });
        }

        srcDoc.destroy();
      }

      // Fill form fields
      if (fields.length > 0) {
        try {
          const form = doc.getForm();
          for (const f of fields) {
            try {
              if (f.type === "text") form.getTextField(f.name).setText(textVals[f.name] || "");
              else if (f.type === "checkbox") {
                if (checkVals[f.name]) form.getCheckBox(f.name).check();
                else form.getCheckBox(f.name).uncheck();
              } else if (f.type === "dropdown" && textVals[f.name])
                form.getDropdown(f.name).select(textVals[f.name]);
            } catch {}
          }
          if (flatten) form.flatten();
        } catch {}
      }

      // Embed signature
      if (signPos && signDataUrl) {
        const sigBytes = await fetch(signDataUrl).then((r) => r.arrayBuffer());
        const isPng = signDataUrl.startsWith("data:image/png");
        const sigImg = isPng ? await doc.embedPng(sigBytes) : await doc.embedJpg(sigBytes);
        const pg = doc.getPage(signPos.page - 1);
        const { width: pw, height: ph } = pg.getSize();
        const sigW = signSize;
        const sigH = sigW / signAspect;
        pg.drawImage(sigImg, {
          x: signPos.xRatio * pw - sigW / 2,
          y: (1 - signPos.yRatio) * ph - sigH / 2,
          width: sigW,
          height: sigH,
        });
      }

      const saved = await doc.save();
      const blob = new Blob([saved.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("PdfEditor apply error:", err);
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  }, [rawBytes, editedTexts, editedSizes, editedColors, textAnnotations, strokes, imageAnnotations, fields, textVals, checkVals, flatten, signPos, signDataUrl, signAspect, signSize, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.pdf$/i, "-edited.pdf");
    a.click();
  }, [resultUrl, file]);

  const resetAll = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    onReset();
  }, [resultUrl, onReset]);

  /* ---------- computed ---------- */

  const fillCount = fields.filter((f) =>
    (f.type === "text" && !!textVals[f.name]?.trim()) ||
    (f.type === "checkbox" && checkVals[f.name]) ||
    (f.type === "dropdown" && !!textVals[f.name])
  ).length;
  const hasSignature = !!signPos && !!signDataUrl;

  const changeCount =
    Object.keys(editedTexts).filter((k) => {
      const [, idxStr] = k.split("-");
      const item = textItems.find((ti) => ti.idx === parseInt(idxStr));
      return item ? editedTexts[k] !== item.str : true;
    }).length +
    textAnnotations.length +
    strokes.length +
    imageAnnotations.length +
    fillCount +
    (hasSignature ? 1 : 0) +
    (flatten && fields.length > 0 ? 1 : 0);

  const selectedItem = selectedIdx !== null ? textItems.find((ti) => ti.idx === selectedIdx) : null;
  const selectedKey = selectedItem ? `${currentPage}-${selectedItem.idx}` : null;

  const selectedAnnotation = selectedAnnotationId ? textAnnotations.find((a) => a.id === selectedAnnotationId) : null;
  const selectedImage = selectedImageId ? imageAnnotations.find((a) => a.id === selectedImageId) : null;

  // Toolbar position for selected text
  const toolbarTarget = selectedItem
    ? { x: selectedItem.vx + Math.max(selectedItem.vw, 20) / 2, y: selectedItem.vy }
    : selectedAnnotation
      ? { x: selectedAnnotation.pdfX * scaleRef.current, y: (pageDimsRef.current.h - selectedAnnotation.pdfY) * scaleRef.current - selectedAnnotation.fontSize * scaleRef.current }
      : selectedImage
        ? { x: selectedImage.pdfX * scaleRef.current + (selectedImage.width * scaleRef.current) / 2, y: (pageDimsRef.current.h - selectedImage.pdfY) * scaleRef.current - selectedImage.height * scaleRef.current }
        : null;

  /* ---------- result screen ---------- */

  if (resultUrl) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 space-y-4">
        <div className="text-center">
          <div className="text-3xl mb-2">&#10003;</div>
          <p className="font-medium">{t("done")}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={download} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
            {t("download")}
          </button>
          <button onClick={resetAll} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">
            {t("reset")}
          </button>
        </div>
      </div>
    );
  }

  /* ---------- editor ---------- */

  return (
    <div className="space-y-3">
      <SafariPdfBanner />
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-0.5 bg-muted rounded-lg p-1 flex-wrap">
          {(["select", "text", "draw", "image", "fill", "sign"] as EditorMode[]).map((m) => {
            const Icon = MODE_ICONS[m];
            return (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setSelectedIdx(null);
                  setSelectedAnnotationId(null);
                  setSelectedImageId(null);
                  setInlineEditing(false);
                  setNewTextPos(null);
                  if (m === "image") onImageUpload();
                  if (m === "sign") setShowSignDialog(true);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === m ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                }`}
              >
                <Icon weight={mode === m ? "fill" : "regular"} className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{t(`mode${m.charAt(0).toUpperCase() + m.slice(1)}` as Parameters<typeof t>[0])}</span>
                {m === "fill" && fields.length > 0 && <span className="text-xs opacity-60">({fields.length})</span>}
                {m === "sign" && hasSignature && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
              </button>
            );
          })}
        </div>

        {/* Inline mode controls */}
        {mode === "draw" && (
          <div className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1">
            <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} className="h-7 w-7 rounded cursor-pointer border-0" />
            <input type="range" min={1} max={10} value={penWidth} onChange={(e) => setPenWidth(Number(e.target.value))} className="w-20 accent-primary" />
            <span className="text-xs text-muted-foreground tabular-nums w-6">{penWidth}px</span>
          </div>
        )}

        {mode === "text" && (
          <div className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1">
            <input type="color" value={newTextColor} onChange={(e) => setNewTextColor(e.target.value)} className="h-7 w-7 rounded cursor-pointer border-0" />
            <input type="number" min={6} max={72} value={newTextSize} onChange={(e) => setNewTextSize(Number(e.target.value))} className="w-16 px-2 py-0.5 rounded border bg-muted text-xs tabular-nums" />
          </div>
        )}

        {mode === "image" && (
          <button onClick={onImageUpload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-background text-sm hover:bg-muted transition-colors">
            <Upload weight="bold" className="h-3.5 w-3.5" />
            {t("uploadImage")}
          </button>
        )}

        {mode === "sign" && (
          <button onClick={() => setShowSignDialog(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-background text-sm hover:bg-muted transition-colors">
            <Signature weight="bold" className="h-3.5 w-3.5" />
            {signDataUrl ? t("signChange") : t("signCreate")}
          </button>
        )}

        <div className="flex gap-1 ml-auto">
          <button
            onClick={doUndo}
            disabled={!history.canUndo()}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30 transition-colors"
            title="Ctrl+Z"
          >
            <ArrowCounterClockwise className="h-4 w-4" />
          </button>
          <button
            onClick={doRedo}
            disabled={!history.canRedo()}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30 transition-colors"
            title="Ctrl+Y"
          >
            <ArrowClockwise className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Hint badge */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        <Info weight="fill" className="h-3.5 w-3.5 shrink-0 text-primary/60" />
        <span>
          {mode === "select" && t("selectHint")}
          {mode === "text" && t("textHint")}
          {mode === "draw" && t("drawHint")}
          {mode === "image" && t("imageHint")}
          {mode === "fill" && t("fillHint")}
          {mode === "sign" && (signDataUrl ? t("signInstruction") : t("signHint"))}
        </span>
      </div>

      {/* Canvas area */}
      <div ref={wrapperRef}>
        <div className="bg-muted/30 rounded-lg p-2 overflow-auto flex justify-center">
          <div
            className="relative"
            style={dims.w > 0 ? { width: dims.w, height: dims.h } : { width: "100%", minHeight: 200 }}
          >
            <canvas ref={previewRef} role="img" aria-label="PDF preview" className="block rounded shadow-lg" />
            <canvas
              ref={overlayRef}
              role="img"
              aria-label="PDF editor overlay"
              className="absolute inset-0 rounded"
              style={{ cursor: mode === "select" ? (hoverIdx !== null ? "text" : "default") : mode === "image" ? "crosshair" : mode === "draw" ? "crosshair" : "crosshair" }}
              onPointerDown={mode === "draw" ? onDrawStart : undefined}
              onPointerMove={mode === "draw" ? onDrawMove : onOverlayMove}
              onPointerUp={mode === "draw" ? onDrawEnd : onOverlayClick}
              onPointerLeave={mode === "draw" ? onDrawEnd : () => setHoverIdx(null)}
            />

            {/* Inline text editor */}
            {mode === "select" && inlineEditing && selectedItem && selectedKey && (
              <InlineTextEditor
                item={selectedItem}
                value={editedTexts[selectedKey] ?? selectedItem.str}
                fontSize={editedSizes[selectedKey] ?? selectedItem.fontSize}
                onChange={onInlineTextChange}
                onSizeChange={onInlineSizeChange}
                onClose={onInlineClose}
                scale={scaleRef.current}
              />
            )}

            {/* Floating toolbar */}
            {toolbarTarget && (selectedItem || selectedAnnotation || selectedImage) && (
              <FloatingToolbar
                x={toolbarTarget.x}
                y={toolbarTarget.y}
                containerRect={wrapperRef.current?.getBoundingClientRect() ? { width: dims.w, height: dims.h, x: 0, y: 0, top: 0, left: 0, right: dims.w, bottom: dims.h, toJSON: () => ({}) } as DOMRect : null}
                fontSize={
                  selectedItem ? (editedSizes[selectedKey!] ?? selectedItem.fontSize) :
                  selectedAnnotation ? selectedAnnotation.fontSize :
                  selectedImage ? selectedImage.width : 14
                }
                color={
                  selectedItem ? (editedColors[selectedKey!] ?? "#000000") :
                  selectedAnnotation ? selectedAnnotation.color :
                  "#000000"
                }
                showDelete={!!selectedAnnotation || !!selectedImage}
                onFontSizeChange={(size) => {
                  if (selectedItem && selectedKey) {
                    const oldSize = editedSizes[selectedKey] ?? selectedItem.fontSize;
                    history.push({ type: "editSize", key: selectedKey, oldSize, newSize: size });
                    setEditedSizes((prev) => ({ ...prev, [selectedKey]: size }));
                  } else if (selectedAnnotation) {
                    onAnnotationSizeChange(selectedAnnotation.id, size);
                  }
                }}
                onColorChange={(color) => {
                  if (selectedItem && selectedKey) {
                    onInlineColorChange(color);
                  } else if (selectedAnnotation) {
                    setTextAnnotations((a) => a.map((x) => (x.id === selectedAnnotation.id ? { ...x, color } : x)));
                  }
                }}
                onDelete={() => {
                  if (selectedAnnotation) {
                    history.push({ type: "removeAnnotation", id: selectedAnnotation.id, annotation: selectedAnnotation });
                    setTextAnnotations((a) => a.filter((x) => x.id !== selectedAnnotation.id));
                    setSelectedAnnotationId(null);
                  } else if (selectedImage) {
                    history.push({ type: "removeImage", id: selectedImage.id, image: selectedImage });
                    setImageAnnotations((a) => a.filter((x) => x.id !== selectedImage.id));
                    setSelectedImageId(null);
                  }
                }}
                t={(key: string) => {
                  try { return t(key as "fontSize"); } catch { return key; }
                }}
              />
            )}

            {/* Draggable text annotations */}
            {textAnnotations
              .filter((a) => a.page === currentPage)
              .map((ann) => (
                <DraggableAnnotation
                  key={ann.id}
                  annotation={ann}
                  scale={scaleRef.current}
                  pageH={pageDimsRef.current.h}
                  isSelected={selectedAnnotationId === ann.id}
                  onSelect={() => {
                    setSelectedAnnotationId(ann.id);
                    setSelectedIdx(null);
                    setSelectedImageId(null);
                    setInlineEditing(false);
                  }}
                  onMove={onAnnotationMove}
                  onEdit={onAnnotationEdit}
                  onSizeChange={onAnnotationSizeChange}
                />
              ))}

            {/* Image annotations */}
            {imageAnnotations
              .filter((im) => im.page === currentPage)
              .map((img) => (
                <ImageAnnotationEl
                  key={img.id}
                  image={img}
                  scale={scaleRef.current}
                  pageH={pageDimsRef.current.h}
                  isSelected={selectedImageId === img.id}
                  onSelect={() => {
                    setSelectedImageId(img.id);
                    setSelectedIdx(null);
                    setSelectedAnnotationId(null);
                    setInlineEditing(false);
                  }}
                  onMove={onImageMove}
                  onResize={onImageResize}
                />
              ))}

            {dims.w === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/30 text-muted-foreground text-sm rounded">
                {t("processing")}
              </div>
            )}
          </div>
        </div>

        {/* Page navigation + Zoom bar */}
        <div className="flex items-center justify-between gap-3 mt-3 px-1">
          {pageCount > 1 ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); setSelectedIdx(null); setInlineEditing(false); }}
                disabled={currentPage <= 1}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30 transition-colors"
              >
                <CaretLeft className="h-4 w-4" />
              </button>
              <span className="text-sm tabular-nums min-w-[80px] text-center font-medium">
                {currentPage} / {pageCount}
              </span>
              <button
                onClick={() => { setCurrentPage((p) => Math.min(pageCount, p + 1)); setSelectedIdx(null); setInlineEditing(false); }}
                disabled={currentPage >= pageCount}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30 transition-colors"
              >
                <CaretRight className="h-4 w-4" />
              </button>
            </div>
          ) : <div />}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
              disabled={zoom <= 0.5}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30 transition-colors"
            >
              <MagnifyingGlassMinus className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="px-2 py-1 rounded-lg hover:bg-muted text-xs tabular-nums min-w-[48px] text-center font-medium"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
              disabled={zoom >= 3}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30 transition-colors"
            >
              <MagnifyingGlassPlus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add text panel (text mode) */}
      {mode === "text" && newTextPos && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <input
            type="text"
            value={newTextInput}
            onChange={(e) => setNewTextInput(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            placeholder={t("editPlaceholder")}
            onKeyDown={(e) => e.key === "Enter" && addTextAnnotation()}
            autoFocus
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
            <input
              type="color"
              value={newTextColor}
              onChange={(e) => setNewTextColor(e.target.value)}
              className="h-7 w-7 rounded cursor-pointer"
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

      {/* Pending image hint */}
      {mode === "image" && pendingImage && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 text-sm text-center">
          {t("imageHint")}
        </div>
      )}

      {/* Fill form panel */}
      {mode === "fill" && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t("noFields")}</p>
          ) : (
            <>
              {fields.map((f) => (
                <div key={f.name} className="space-y-1">
                  <label className="text-sm font-medium">{f.name}</label>
                  {f.type === "text" && (
                    <input type="text" value={textVals[f.name] ?? ""} onChange={(e) => setTextVals((v) => ({ ...v, [f.name]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" placeholder={f.name} />
                  )}
                  {f.type === "checkbox" && (
                    <div className="pt-1"><input type="checkbox" checked={checkVals[f.name] ?? false} onChange={(e) => setCheckVals((v) => ({ ...v, [f.name]: e.target.checked }))} className="h-4 w-4" /></div>
                  )}
                  {f.type === "dropdown" && (
                    <select value={textVals[f.name] ?? ""} onChange={(e) => setTextVals((v) => ({ ...v, [f.name]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border bg-background text-sm">
                      <option value="">—</option>
                      {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                </div>
              ))}
              <label className="flex items-center gap-2 pt-2 text-sm">
                <input type="checkbox" checked={flatten} onChange={(e) => setFlatten(e.target.checked)} className="h-4 w-4" />
                <span>{t("flatten")}</span>
                <span className="text-xs text-muted-foreground">— {t("flattenHint")}</span>
              </label>
            </>
          )}
        </div>
      )}

      {/* Signature size slider - shown when signature is placed */}
      {mode === "sign" && signDataUrl && (
        <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={signDataUrl} alt="Signature" className="h-8 border rounded bg-white px-1" />
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-muted-foreground">{t("fontSize")}:</span>
            <input type="range" min={80} max={400} value={signSize} onChange={(e) => setSignSize(Number(e.target.value))} className="flex-1 accent-primary" />
            <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{signSize}px</span>
          </div>
          <button onClick={clearSig} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Signature Dialog/Modal */}
      {showSignDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowSignDialog(false); }}>
          <div className="w-full max-w-md rounded-xl border bg-background p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{t("signCreate")}</h3>
              <button onClick={() => setShowSignDialog(false)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {(["draw", "type", "upload"] as const).map((m) => (
                <button key={m} onClick={() => { setSignMode(m); setSignDataUrl(""); setSignPos(null); }} className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${signMode === m ? "bg-background shadow-sm" : "hover:bg-background/50"}`}>
                  {t(`sign${m.charAt(0).toUpperCase() + m.slice(1)}` as Parameters<typeof t>[0])}
                </button>
              ))}
            </div>

            {signMode === "draw" && (
              <div className="space-y-3">
                <div className="border-2 border-muted rounded-lg bg-white overflow-hidden" style={{ height: "140px" }}>
                  <canvas ref={signCanvasRef} style={{ width: "100%", height: "100%" }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { saveDrawnSig(); setShowSignDialog(false); }} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">{t("signSave")}</button>
                  <button onClick={clearSig} className="px-4 py-2 bg-muted rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">{t("signClear")}</button>
                </div>
              </div>
            )}

            {signMode === "type" && (
              <div className="space-y-3">
                <input type="text" value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder={t("signPlaceholder")} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" autoFocus />
                {typedName && (
                  <div className="bg-white border rounded-lg p-4 text-center">
                    <p className="text-3xl italic" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{typedName}</p>
                  </div>
                )}
                <button onClick={() => { genTypedSig(); setShowSignDialog(false); }} disabled={!typedName.trim()} className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">{t("signSave")}</button>
              </div>
            )}

            {signMode === "upload" && (
              <div onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = () => { if (i.files?.[0]) { uploadSig(i.files[0]); setShowSignDialog(false); } }; i.click(); }} className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">{t("signUploadHint")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}

      {/* Sticky bottom save bar */}
      <div className="sticky bottom-0 z-30 -mx-4 mt-4 border-t bg-background/95 backdrop-blur-sm px-4 py-3">
        <button
          onClick={apply}
          disabled={processing || changeCount === 0}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          <FloppyDisk weight="bold" className="h-5 w-5" />
          {processing ? t("processing") : changeCount > 0 ? `${t("apply")} (${changeCount})` : t("apply")}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

interface FieldInfo {
  name: string;
  type: "text" | "checkbox" | "dropdown";
  options?: string[];
}

interface SignPos {
  page: number;
  xRatio: number;
  yRatio: number;
}

let pdfjsReady: typeof import("pdfjs-dist") | null = null;
async function getPdfjs() {
  if (pdfjsReady) return pdfjsReady;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
  pdfjsReady = lib;
  return lib;
}

export function PdfFillSign() {
  const t = useTranslations("tools.pdf-fill-sign.ui");
  const [file, setFile] = useState<File | null>(null);
  const [rawBytes, setRawBytes] = useState<ArrayBuffer | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");

  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [fields, setFields] = useState<FieldInfo[]>([]);
  const [textVals, setTextVals] = useState<Record<string, string>>({});
  const [checkVals, setCheckVals] = useState<Record<string, boolean>>({});
  const [flatten, setFlatten] = useState(false);

  const [tab, setTab] = useState<"fill" | "sign">("fill");
  const [signMode, setSignMode] = useState<"draw" | "type" | "upload">("draw");
  const [signDataUrl, setSignDataUrl] = useState("");
  const [typedName, setTypedName] = useState("");
  const [signPos, setSignPos] = useState<SignPos | null>(null);
  const [signAspect, setSignAspect] = useState(2.5);

  const previewRef = useRef<HTMLCanvasElement>(null);
  const signCanvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
        const { PDFDocument } = await import("pdf-lib");
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        setPageCount(doc.getPageCount());
        try {
          const form = doc.getForm();
          const allFields = form.getFields();
          const detected: FieldInfo[] = [];
          const tv: Record<string, string> = {};
          const cv: Record<string, boolean> = {};
          for (const field of allFields) {
            const name = field.getName();
            const kind = field.constructor.name;
            if (kind === "PDFTextField") {
              detected.push({ name, type: "text" });
              const val = (field as any).getText?.() ?? "";
              if (val) tv[name] = val;
            } else if (kind === "PDFCheckBox") {
              detected.push({ name, type: "checkbox" });
              cv[name] = !!(field as any).isChecked?.();
            } else if (kind === "PDFDropdown") {
              const opts = (field as any).getOptions?.() ?? [];
              detected.push({ name, type: "dropdown", options: opts });
              const sel = (field as any).getSelected?.()?.[0] ?? "";
              if (sel) tv[name] = sel;
            }
          }
          setFields(detected);
          setTextVals(tv);
          setCheckVals(cv);
          setTab(detected.length > 0 ? "fill" : "sign");
        } catch {
          setFields([]);
          setTab("sign");
        }
      } catch {
        try {
          const pdfjs = await getPdfjs();
          const doc = await pdfjs.getDocument({ data: bytes }).promise;
          setPageCount(doc.numPages);
          doc.destroy();
        } catch {
          setError(t("error"));
          return;
        }
        setFields([]);
        setTab("sign");
      }
      setCurrentPage(1);
    },
    [t]
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
    const svp = page.getViewport({ scale });

    canvas.width = svp.width;
    canvas.height = svp.height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await (page.render({ canvasContext: ctx, viewport: svp, canvas } as Parameters<typeof page.render>[0]).promise);

    if (signPos?.page === currentPage && signDataUrl) {
      const img = new Image();
      img.src = signDataUrl;
      await new Promise<void>((r) => {
        img.onload = () => r();
        img.onerror = () => r();
      });
      if (img.naturalWidth > 0) {
        const sw = 200 * scale;
        const sh = sw / signAspect;
        const x = signPos.xRatio * canvas.width - sw / 2;
        const y = signPos.yRatio * canvas.height - sh / 2;
        ctx.drawImage(img, x, y, sw, sh);
        ctx.strokeStyle = "#6366F1";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x, y, sw, sh);
        ctx.setLineDash([]);
      }
    }

    doc.destroy();
  }, [rawBytes, currentPage, signPos, signDataUrl, signAspect]);

  useEffect(() => {
    if (rawBytes && !resultUrl) renderPreview();
  }, [rawBytes, currentPage, renderPreview, resultUrl]);

  /* ---------- signature pad ---------- */

  useEffect(() => {
    if (tab !== "sign" || signMode !== "draw" || !signCanvasRef.current) return;
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
  }, [tab, signMode]);

  const saveDrawnSig = useCallback(() => {
    if (!padRef.current || padRef.current.isEmpty()) return;
    const url = padRef.current.toDataURL("image/png");
    setSignDataUrl(url);
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0) setSignAspect(img.naturalWidth / img.naturalHeight);
    };
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
    c.width = 600;
    c.height = 200;
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
      img.onload = () => {
        if (img.naturalWidth > 0) setSignAspect(img.naturalWidth / img.naturalHeight);
      };
      img.src = url;
    };
    reader.readAsDataURL(f);
  }, []);

  /* ---------- place ---------- */

  const onPreviewClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (tab !== "sign" || !signDataUrl) return;
      const rect = previewRef.current!.getBoundingClientRect();
      setSignPos({
        page: currentPage,
        xRatio: (e.clientX - rect.left) / rect.width,
        yRatio: (e.clientY - rect.top) / rect.height,
      });
    },
    [tab, signDataUrl, currentPage]
  );

  /* ---------- apply ---------- */

  const apply = useCallback(async () => {
    if (!rawBytes || !file) return;
    setProcessing(true);
    setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
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
          doc.addPage([origVp.width, origVp.height]).drawImage(img, {
            x: 0,
            y: 0,
            width: origVp.width,
            height: origVp.height,
          });
          c.width = 0;
          c.height = 0;
        }
        src.destroy();
      }

      // Fill fields
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
        const sigImg = isPng
          ? await doc.embedPng(sigBytes)
          : await doc.embedJpg(sigBytes);
        const pg = doc.getPage(signPos.page - 1);
        const { width: pw, height: ph } = pg.getSize();
        const sigW = 200;
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
    } catch {
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  }, [rawBytes, file, fields, textVals, checkVals, flatten, signPos, signDataUrl, signAspect, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.pdf$/i, "-signed.pdf");
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
    setFields([]);
    setTextVals({});
    setCheckVals({});
    setSignDataUrl("");
    setTypedName("");
    setSignPos(null);
    setFlatten(false);
  }, [resultUrl]);

  const hasChanges =
    fields.some(
      (f) =>
        (f.type === "text" && !!textVals[f.name]?.trim()) ||
        (f.type === "checkbox" && checkVals[f.name] === true) ||
        (f.type === "dropdown" && !!textVals[f.name])
    ) ||
    (!!signPos && !!signDataUrl) ||
    (flatten && fields.length > 0);

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
          <div className="text-4xl mb-3">📝</div>
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

          {/* Preview */}
          <div ref={wrapperRef}>
            <div className="bg-muted/30 rounded-lg p-2 flex justify-center overflow-hidden">
              <canvas
                ref={previewRef}
                onClick={onPreviewClick}
                className="shadow-lg rounded"
                style={{
                  maxWidth: "100%",
                  maxHeight: "500px",
                  cursor: tab === "sign" && signDataUrl ? "crosshair" : "default",
                }}
              />
            </div>
            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-40 text-sm"
                >
                  {t("prev")}
                </button>
                <span className="text-sm text-muted-foreground">
                  {t("page")} {currentPage} {t("of")} {pageCount}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                  disabled={currentPage >= pageCount}
                  className="px-3 py-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-40 text-sm"
                >
                  {t("next")}
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setTab("fill")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${tab === "fill" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
            >
              {t("tabFill")}{" "}
              {fields.length > 0 && (
                <span className="ml-1 text-xs opacity-60">({fields.length})</span>
              )}
            </button>
            <button
              onClick={() => setTab("sign")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${tab === "sign" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
            >
              {t("tabSign")}
            </button>
          </div>

          {/* Fill tab */}
          {tab === "fill" && (
            <div className="space-y-3">
              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("noFields")}
                </p>
              ) : (
                <>
                  {fields.map((f) => (
                    <div key={f.name} className="space-y-1">
                      <label className="text-sm font-medium">{f.name}</label>
                      {f.type === "text" && (
                        <input
                          type="text"
                          value={textVals[f.name] ?? ""}
                          onChange={(e) =>
                            setTextVals((v) => ({ ...v, [f.name]: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                          placeholder={f.name}
                        />
                      )}
                      {f.type === "checkbox" && (
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={checkVals[f.name] ?? false}
                            onChange={(e) =>
                              setCheckVals((v) => ({ ...v, [f.name]: e.target.checked }))
                            }
                            className="h-4 w-4"
                          />
                        </div>
                      )}
                      {f.type === "dropdown" && (
                        <select
                          value={textVals[f.name] ?? ""}
                          onChange={(e) =>
                            setTextVals((v) => ({ ...v, [f.name]: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                        >
                          <option value="">—</option>
                          {f.options?.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                  <label className="flex items-center gap-2 pt-2 text-sm">
                    <input
                      type="checkbox"
                      checked={flatten}
                      onChange={(e) => setFlatten(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span>{t("flatten")}</span>
                    <span className="text-xs text-muted-foreground">
                      — {t("flattenHint")}
                    </span>
                  </label>
                </>
              )}
            </div>
          )}

          {/* Sign tab */}
          {tab === "sign" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {(["draw", "type", "upload"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSignMode(m);
                      setSignDataUrl("");
                      setSignPos(null);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${signMode === m ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                  >
                    {t(
                      `sign${m.charAt(0).toUpperCase() + m.slice(1)}` as
                        | "signDraw"
                        | "signType"
                        | "signUpload"
                    )}
                  </button>
                ))}
              </div>

              {signMode === "draw" && (
                <div>
                  <div
                    className="border-2 border-muted rounded-lg bg-white overflow-hidden"
                    style={{ height: "150px" }}
                  >
                    <canvas
                      ref={signCanvasRef}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={saveDrawnSig}
                      className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                    >
                      {t("signSave")}
                    </button>
                    <button
                      onClick={clearSig}
                      className="px-4 py-1.5 bg-muted rounded-lg text-sm font-medium hover:bg-muted/80"
                    >
                      {t("signClear")}
                    </button>
                  </div>
                </div>
              )}

              {signMode === "type" && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder={t("signPlaceholder")}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                  />
                  {typedName && (
                    <div className="bg-white border rounded-lg p-4">
                      <p
                        className="text-3xl italic"
                        style={{
                          fontFamily: "Georgia, 'Times New Roman', serif",
                        }}
                      >
                        {typedName}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={genTypedSig}
                    disabled={!typedName.trim()}
                    className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    {t("signSave")}
                  </button>
                </div>
              )}

              {signMode === "upload" && (
                <div
                  onClick={() => {
                    const i = document.createElement("input");
                    i.type = "file";
                    i.accept = "image/*";
                    i.onchange = () => i.files?.[0] && uploadSig(i.files[0]);
                    i.click();
                  }}
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <p className="text-sm font-medium">{t("signUploadHint")}</p>
                </div>
              )}

              {signDataUrl && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <img
                    src={signDataUrl}
                    alt="Signature"
                    className="max-h-16 border rounded bg-white p-1"
                  />
                  <p className="text-sm text-muted-foreground flex-1">
                    {signPos ? t("signPlaced") : t("signInstruction")}
                  </p>
                  <button
                    onClick={clearSig}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
              {error}
            </div>
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

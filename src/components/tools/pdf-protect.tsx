"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { configurePdfjsWorker } from "@/lib/pdf-utils";
import { ShieldCheck } from "@phosphor-icons/react";

export function PdfProtect() {
  const t = useTranslations("tools.pdf-protect.ui");
  const [file, setFile] = useState<File | null>(null);
  const [userPassword, setUserPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [permissions, setPermissions] = useState({ print: true, copy: false, modify: false });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null);

  useEffect(() => {
    import("pdfjs-dist").then((lib) => {
      configurePdfjsWorker(lib);
      setPdfjsLib(lib);
    }).catch((err) => {
      console.error("Failed to load pdfjs-dist:", err);
    });
  }, []);

  const loadFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setError(""); setResultUrl(""); setFile(f);
  }, []);

  const protect = useCallback(async () => {
    if (!file || !userPassword || !pdfjsLib) return;
    setProcessing(true); setError(""); setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const srcDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const total = srcDoc.numPages;

      const { jsPDF } = await import("jspdf");

      // Get first page dimensions for initial doc setup
      const firstPage = await srcDoc.getPage(1);
      const fv = firstPage.getViewport({ scale: 1 });
      const wMm = (fv.width * 25.4) / 72;
      const hMm = (fv.height * 25.4) / 72;

      const userPerms: ("print" | "modify" | "copy" | "annot-forms")[] = [];
      if (permissions.print) userPerms.push("print");
      if (permissions.copy) userPerms.push("copy");
      if (permissions.modify) userPerms.push("modify", "annot-forms");

      const pdf = new jsPDF({
        orientation: wMm > hMm ? "landscape" : "portrait",
        unit: "mm",
        format: [wMm, hMm],
        encryption: {
          userPassword,
          ownerPassword: ownerPassword || userPassword,
          userPermissions: userPerms,
        },
      });

      for (let i = 1; i <= total; i++) {
        const page = await srcDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await (page.render({ canvasContext: ctx, viewport, canvas } as Parameters<typeof page.render>[0]).promise);

        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        const origVp = page.getViewport({ scale: 1 });
        const pw = (origVp.width * 25.4) / 72;
        const ph = (origVp.height * 25.4) / 72;

        if (i > 1) pdf.addPage([pw, ph], pw > ph ? "landscape" : "portrait");
        pdf.addImage(imgData, "JPEG", 0, 0, pw, ph);

        canvas.width = 0; canvas.height = 0;
        setProgress(Math.round((i / total) * 100));
      }

      srcDoc.destroy();
      const blob = pdf.output("blob");
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("PDF Protect error:", err);
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  }, [file, userPassword, ownerPassword, permissions, pdfjsLib, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a"); a.href = resultUrl;
    a.download = file.name.replace(/\.pdf$/i, "_protected.pdf"); a.click();
  }, [resultUrl, file]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setUserPassword(""); setOwnerPassword("");
    setPermissions({ print: true, copy: false, modify: false });
    setResultUrl(""); setError("");
  }, [resultUrl]);

  const togglePerm = (key: keyof typeof permissions) =>
    setPermissions((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf"; input.onchange = () => input.files?.[0] && loadFile(input.files[0]); input.click(); }}
        >
          <ShieldCheck size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t("password")}</label>
            <input type="text" autoComplete="off" data-1p-ignore data-lpignore="true" value={userPassword} onChange={(e) => setUserPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t("ownerPassword")}</label>
            <input type="text" autoComplete="off" data-1p-ignore data-lpignore="true" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)}
              placeholder={t("ownerPasswordPlaceholder")} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <p className="text-xs text-muted-foreground mt-1">{t("ownerPasswordHint")}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t("permissions")}</label>
            <div className="space-y-2">
              {(["print", "copy", "modify"] as const).map((k) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={permissions[k]} onChange={() => togglePerm(k)} className="rounded" />
                  <span className="text-sm">{t(`perm_${k}`)}</span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={protect} disabled={processing || !userPassword || !pdfjsLib}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {processing ? `${t("processing")} ${progress}%` : t("protect")}
          </button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">✓</div>
          <p className="font-medium">{t("done")}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={download} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("download")}</button>
            <button onClick={reset} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
          </div>
        </div>
      )}
      {error && <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>}
    </div>
  );
}

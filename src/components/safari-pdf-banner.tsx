"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Warning, X } from "@phosphor-icons/react";

export function SafariPdfBanner() {
  const t = useTranslations("common.safariBanner");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm">
      <Warning size={20} weight="duotone" className="mt-0.5 shrink-0 text-yellow-500" />
      <div className="flex-1">
        <p className="font-medium text-yellow-600 dark:text-yellow-400">{t("title")}</p>
        <p className="mt-1 text-muted-foreground">{t("message")}</p>
      </div>
      <button onClick={() => setShow(false)} className="shrink-0 text-muted-foreground hover:text-foreground">
        <X size={16} />
      </button>
    </div>
  );
}

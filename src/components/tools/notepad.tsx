"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "tuttilo_notepad";

export function Notepad() {
  const t = useTranslations("tools.notepad.ui");
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setText(stored);
  }, []);

  const save = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [text]);

  const download = useCallback(() => {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "note.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [text]);

  const clear = useCallback(() => {
    setText("");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const lines = text ? text.split("\n").length : 0;

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("placeholder")}
        className="w-full h-96 rounded-lg border border-border bg-background p-4 text-sm focus:border-primary focus:outline-none resize-none font-mono"
        onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); save(); } }}
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground">
          {words} {t("words")} · {chars} {t("characters")} · {lines} {t("lines")}
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {saved ? t("saved") : t("save")}
          </button>
          <button onClick={download} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">{t("download")}</button>
          <button onClick={clear} className="rounded-lg border border-border px-4 py-2 text-sm text-red-400 hover:bg-muted">{t("clear")}</button>
        </div>
      </div>
    </div>
  );
}

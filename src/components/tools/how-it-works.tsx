"use client";

import { useTranslations } from "next-intl";
import { Upload, GearSix as Settings, Download } from "@phosphor-icons/react";

const steps = [
  { icon: Upload, key: "upload" },
  { icon: Settings, key: "process" },
  { icon: Download, key: "download" },
] as const;

export function HowItWorks() {
  const t = useTranslations("common.howItWorks");

  return (
    <div className="mb-8 rounded-xl border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-2">
        {steps.map(({ icon: Icon, key }, i) => (
          <div key={key} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2.5 flex-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500 text-sm font-bold">
                {i + 1}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{t(`${key}.title`)}</p>
                <p className="text-xs text-muted-foreground truncate hidden sm:block">
                  {t(`${key}.desc`)}
                </p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden sm:block h-px w-8 bg-border shrink-0 mx-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

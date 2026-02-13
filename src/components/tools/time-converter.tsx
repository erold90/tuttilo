"use client";

import { useTranslations } from "next-intl";
import { FactorConverter } from "./shared/factor-converter";

const units = [
  { id: "ms", factor: 0.001, symbol: "ms" },
  { id: "s", factor: 1, symbol: "s" },
  { id: "min", factor: 60, symbol: "min" },
  { id: "h", factor: 3600, symbol: "h" },
  { id: "d", factor: 86400, symbol: "d" },
  { id: "wk", factor: 604800, symbol: "wk" },
  { id: "mo", factor: 2629746, symbol: "mo" },
  { id: "yr", factor: 31556952, symbol: "yr" },
];

export default function TimeConverter() {
  const t = useTranslations("tools.time-converter.ui");
  return <FactorConverter units={units} defaultFrom="h" defaultTo="min" t={t} />;
}

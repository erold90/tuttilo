"use client";

import { useTranslations } from "next-intl";
import { FactorConverter } from "./shared/factor-converter";

const units = [
  { id: "w", factor: 1, symbol: "W" },
  { id: "kw", factor: 1000, symbol: "kW" },
  { id: "mw", factor: 1000000, symbol: "MW" },
  { id: "hp", factor: 745.7, symbol: "hp" },
  { id: "ps", factor: 735.499, symbol: "PS" },
  { id: "btuh", factor: 0.293071, symbol: "BTU/h" },
  { id: "ftlbs", factor: 1.35582, symbol: "ft·lbf/s" },
];

export default function PowerConverter() {
  const t = useTranslations("tools.power-converter.ui");
  return <FactorConverter units={units} defaultFrom="hp" defaultTo="kw" t={t} />;
}

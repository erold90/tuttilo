"use client";

import { useTranslations } from "next-intl";
import { FactorConverter } from "./shared/factor-converter";

const units = [
  { id: "b", factor: 1, symbol: "B" },
  { id: "kb", factor: 1024, symbol: "KB" },
  { id: "mb", factor: 1048576, symbol: "MB" },
  { id: "gb", factor: 1073741824, symbol: "GB" },
  { id: "tb", factor: 1099511627776, symbol: "TB" },
  { id: "pb", factor: 1125899906842624, symbol: "PB" },
  { id: "kbit", factor: 128, symbol: "Kbit" },
  { id: "mbit", factor: 131072, symbol: "Mbit" },
  { id: "gbit", factor: 134217728, symbol: "Gbit" },
];

export default function DataSizeConverter() {
  const t = useTranslations("tools.data-size-converter.ui");
  return <FactorConverter units={units} defaultFrom="mb" defaultTo="gb" t={t} />;
}

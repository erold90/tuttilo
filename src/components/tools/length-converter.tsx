"use client";

import { useTranslations } from "next-intl";
import { FactorConverter } from "./shared/factor-converter";

const units = [
  { id: "mm", factor: 0.001, symbol: "mm" },
  { id: "cm", factor: 0.01, symbol: "cm" },
  { id: "m", factor: 1, symbol: "m" },
  { id: "km", factor: 1000, symbol: "km" },
  { id: "in", factor: 0.0254, symbol: "in" },
  { id: "ft", factor: 0.3048, symbol: "ft" },
  { id: "yd", factor: 0.9144, symbol: "yd" },
  { id: "mi", factor: 1609.344, symbol: "mi" },
  { id: "nm", factor: 1852, symbol: "nmi" },
];

export default function LengthConverter() {
  const t = useTranslations("tools.length-converter.ui");
  return <FactorConverter units={units} defaultFrom="m" defaultTo="ft" t={t} />;
}

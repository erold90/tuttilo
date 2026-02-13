"use client";

import { useTranslations } from "next-intl";
import { FactorConverter } from "./shared/factor-converter";

const units = [
  { id: "sqmm", factor: 0.000001, symbol: "mm\u00B2" },
  { id: "sqcm", factor: 0.0001, symbol: "cm\u00B2" },
  { id: "sqm", factor: 1, symbol: "m\u00B2" },
  { id: "ha", factor: 10000, symbol: "ha" },
  { id: "sqkm", factor: 1000000, symbol: "km\u00B2" },
  { id: "sqin", factor: 0.00064516, symbol: "in\u00B2" },
  { id: "sqft", factor: 0.092903, symbol: "ft\u00B2" },
  { id: "sqyd", factor: 0.836127, symbol: "yd\u00B2" },
  { id: "ac", factor: 4046.86, symbol: "ac" },
  { id: "sqmi", factor: 2589988, symbol: "mi\u00B2" },
];

export default function AreaConverter() {
  const t = useTranslations("tools.area-converter.ui");
  return <FactorConverter units={units} defaultFrom="sqm" defaultTo="sqft" t={t} />;
}

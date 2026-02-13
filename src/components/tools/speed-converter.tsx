"use client";

import { useTranslations } from "next-intl";
import { FactorConverter } from "./shared/factor-converter";

const units = [
  { id: "ms", factor: 1, symbol: "m/s" },
  { id: "kmh", factor: 0.277778, symbol: "km/h" },
  { id: "mph", factor: 0.44704, symbol: "mph" },
  { id: "kn", factor: 0.514444, symbol: "kn" },
  { id: "fts", factor: 0.3048, symbol: "ft/s" },
  { id: "mach", factor: 343, symbol: "Mach" },
];

export default function SpeedConverter() {
  const t = useTranslations("tools.speed-converter.ui");
  return <FactorConverter units={units} defaultFrom="kmh" defaultTo="mph" t={t} />;
}

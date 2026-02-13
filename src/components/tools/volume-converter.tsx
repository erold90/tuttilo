"use client";

import { useTranslations } from "next-intl";
import { FactorConverter } from "./shared/factor-converter";

const units = [
  { id: "ml", factor: 0.000001, symbol: "mL" },
  { id: "l", factor: 0.001, symbol: "L" },
  { id: "m3", factor: 1, symbol: "m\u00B3" },
  { id: "tsp", factor: 0.00000492892, symbol: "tsp" },
  { id: "tbsp", factor: 0.0000147868, symbol: "tbsp" },
  { id: "floz", factor: 0.0000295735, symbol: "fl oz" },
  { id: "cup", factor: 0.000236588, symbol: "cup" },
  { id: "pt", factor: 0.000473176, symbol: "pt" },
  { id: "qt", factor: 0.000946353, symbol: "qt" },
  { id: "gal", factor: 0.00378541, symbol: "gal" },
];

export default function VolumeConverter() {
  const t = useTranslations("tools.volume-converter.ui");
  return <FactorConverter units={units} defaultFrom="l" defaultTo="gal" t={t} />;
}

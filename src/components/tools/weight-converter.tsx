"use client";

import { useTranslations } from "next-intl";
import { FactorConverter } from "./shared/factor-converter";

const units = [
  { id: "mg", factor: 0.000001, symbol: "mg" },
  { id: "g", factor: 0.001, symbol: "g" },
  { id: "kg", factor: 1, symbol: "kg" },
  { id: "t", factor: 1000, symbol: "t" },
  { id: "oz", factor: 0.0283495, symbol: "oz" },
  { id: "lb", factor: 0.453592, symbol: "lb" },
  { id: "st", factor: 6.35029, symbol: "st" },
];

export default function WeightConverter() {
  const t = useTranslations("tools.weight-converter.ui");
  return <FactorConverter units={units} defaultFrom="kg" defaultTo="lb" t={t} />;
}

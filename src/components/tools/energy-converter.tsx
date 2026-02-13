"use client";

import { useTranslations } from "next-intl";
import { FactorConverter } from "./shared/factor-converter";

const units = [
  { id: "j", factor: 1, symbol: "J" },
  { id: "kj", factor: 1000, symbol: "kJ" },
  { id: "cal", factor: 4.184, symbol: "cal" },
  { id: "kcal", factor: 4184, symbol: "kcal" },
  { id: "wh", factor: 3600, symbol: "Wh" },
  { id: "kwh", factor: 3600000, symbol: "kWh" },
  { id: "btu", factor: 1055.06, symbol: "BTU" },
  { id: "ev", factor: 1.602e-19, symbol: "eV" },
  { id: "ft_lbf", factor: 1.35582, symbol: "ft·lbf" },
];

export default function EnergyConverter() {
  const t = useTranslations("tools.energy-converter.ui");
  return <FactorConverter units={units} defaultFrom="kcal" defaultTo="kj" t={t} />;
}

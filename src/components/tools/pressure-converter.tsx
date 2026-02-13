"use client";

import { useTranslations } from "next-intl";
import { FactorConverter } from "./shared/factor-converter";

const units = [
  { id: "pa", factor: 1, symbol: "Pa" },
  { id: "kpa", factor: 1000, symbol: "kPa" },
  { id: "mpa", factor: 1000000, symbol: "MPa" },
  { id: "bar", factor: 100000, symbol: "bar" },
  { id: "atm", factor: 101325, symbol: "atm" },
  { id: "psi", factor: 6894.76, symbol: "psi" },
  { id: "mmhg", factor: 133.322, symbol: "mmHg" },
  { id: "torr", factor: 133.3224, symbol: "Torr" },
];

export default function PressureConverter() {
  const t = useTranslations("tools.pressure-converter.ui");
  return <FactorConverter units={units} defaultFrom="bar" defaultTo="psi" t={t} />;
}

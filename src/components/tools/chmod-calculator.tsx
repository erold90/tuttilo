"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Perm = { read: boolean; write: boolean; execute: boolean };

function permToOctal(p: Perm): number { return (p.read ? 4 : 0) + (p.write ? 2 : 0) + (p.execute ? 1 : 0); }
function octalToPerm(n: number): Perm { return { read: !!(n & 4), write: !!(n & 2), execute: !!(n & 1) }; }
function permToStr(p: Perm): string { return (p.read ? "r" : "-") + (p.write ? "w" : "-") + (p.execute ? "x" : "-"); }

export default function ChmodCalculator() {
  const t = useTranslations("tools.chmod-calculator");
  const [owner, setOwner] = useState<Perm>({ read: true, write: true, execute: true });
  const [group, setGroup] = useState<Perm>({ read: true, write: false, execute: true });
  const [other, setOther] = useState<Perm>({ read: true, write: false, execute: true });

  const octal = useMemo(() => `${permToOctal(owner)}${permToOctal(group)}${permToOctal(other)}`, [owner, group, other]);
  const symbolic = useMemo(() => `-${permToStr(owner)}${permToStr(group)}${permToStr(other)}`, [owner, group, other]);

  const setFromOctal = (val: string) => {
    if (/^[0-7]{3}$/.test(val)) {
      setOwner(octalToPerm(+val[0]));
      setGroup(octalToPerm(+val[1]));
      setOther(octalToPerm(+val[2]));
    }
  };

  const PermRow = ({ label, perm, setPerm }: { label: string; perm: Perm; setPerm: (p: Perm) => void }) => (
    <tr>
      <td className="py-2 pr-4 font-medium text-zinc-700 dark:text-zinc-300">{label}</td>
      {(["read", "write", "execute"] as const).map(k => (
        <td key={k} className="py-2 px-4 text-center">
          <input type="checkbox" checked={perm[k]} onChange={e => setPerm({ ...perm, [k]: e.target.checked })} className="w-4 h-4 accent-blue-600" />
        </td>
      ))}
    </tr>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.octal")}:</label>
        <input value={octal} onChange={e => setFromOctal(e.target.value)} className="w-24 px-3 py-2 font-mono text-xl text-center rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800" maxLength={3} />
        <code className="px-3 py-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg font-mono text-sm">{symbolic}</code>
        <code className="px-3 py-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg font-mono text-sm">chmod {octal}</code>
      </div>
      <div className="overflow-x-auto border border-zinc-300 dark:border-zinc-600 rounded-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-700">
              <th className="py-2 pr-4 pl-3 text-left">{t("ui.who")}</th>
              <th className="py-2 px-4">{t("ui.read")} (r)</th>
              <th className="py-2 px-4">{t("ui.write")} (w)</th>
              <th className="py-2 px-4">{t("ui.execute")} (x)</th>
            </tr>
          </thead>
          <tbody>
            <PermRow label={t("ui.owner")} perm={owner} setPerm={setOwner} />
            <PermRow label={t("ui.group")} perm={group} setPerm={setGroup} />
            <PermRow label={t("ui.others")} perm={other} setPerm={setOther} />
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 flex-wrap">
        {["755", "644", "777", "700", "600", "444"].map(val => (
          <button key={val} onClick={() => setFromOctal(val)} className="px-3 py-1.5 text-sm font-mono bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600">{val}</button>
        ))}
      </div>
    </div>
  );
}

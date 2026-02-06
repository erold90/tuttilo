"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

interface DiffLine {
  type: "equal" | "added" | "removed";
  text: string;
  lineNum: { left?: number; right?: number };
}

function computeDiff(a: string, b: string): DiffLine[] {
  const linesA = a.split("\n");
  const linesB = b.split("\n");
  const result: DiffLine[] = [];

  const max = Math.max(linesA.length, linesB.length);
  // Simple line-by-line diff (LCS would be better but heavier)
  let ia = 0, ib = 0;

  // Use a basic LCS approach for better results
  const dp: number[][] = Array.from({ length: linesA.length + 1 }, () =>
    new Array(linesB.length + 1).fill(0)
  );
  for (let i = 1; i <= linesA.length; i++) {
    for (let j = 1; j <= linesB.length; j++) {
      dp[i][j] = linesA[i - 1] === linesB[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack
  ia = linesA.length;
  ib = linesB.length;
  const stack: DiffLine[] = [];

  while (ia > 0 || ib > 0) {
    if (ia > 0 && ib > 0 && linesA[ia - 1] === linesB[ib - 1]) {
      stack.push({ type: "equal", text: linesA[ia - 1], lineNum: { left: ia, right: ib } });
      ia--; ib--;
    } else if (ib > 0 && (ia === 0 || dp[ia][ib - 1] >= dp[ia - 1][ib])) {
      stack.push({ type: "added", text: linesB[ib - 1], lineNum: { right: ib } });
      ib--;
    } else {
      stack.push({ type: "removed", text: linesA[ia - 1], lineNum: { left: ia } });
      ia--;
    }
  }

  return stack.reverse();
}

export function DiffChecker() {
  const t = useTranslations("tools.diff-checker.ui");
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");

  const diff = useMemo(() => computeDiff(textA, textB), [textA, textB]);
  const added = diff.filter((d) => d.type === "added").length;
  const removed = diff.filter((d) => d.type === "removed").length;
  const unchanged = diff.filter((d) => d.type === "equal").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("original")}</label>
          <textarea
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder={t("placeholderA")}
            className="h-48 w-full rounded-lg border border-border bg-background p-3 font-mono text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("modified")}</label>
          <textarea
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder={t("placeholderB")}
            className="h-48 w-full rounded-lg border border-border bg-background p-3 font-mono text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {(textA || textB) && (
        <>
          <div className="flex gap-4 text-sm">
            <span className="text-green-500">+{added} {t("added")}</span>
            <span className="text-red-500">-{removed} {t("removed")}</span>
            <span className="text-muted-foreground">{unchanged} {t("unchanged")}</span>
          </div>

          <div className="max-h-96 overflow-auto rounded-lg border border-border bg-card">
            {diff.map((line, i) => (
              <div
                key={i}
                className={`flex border-b border-border/50 font-mono text-xs ${
                  line.type === "added"
                    ? "bg-green-500/10 text-green-400"
                    : line.type === "removed"
                    ? "bg-red-500/10 text-red-400"
                    : "text-muted-foreground"
                }`}
              >
                <span className="w-10 shrink-0 select-none border-r border-border/50 px-2 py-1 text-right text-muted-foreground/50">
                  {line.lineNum.left ?? ""}
                </span>
                <span className="w-10 shrink-0 select-none border-r border-border/50 px-2 py-1 text-right text-muted-foreground/50">
                  {line.lineNum.right ?? ""}
                </span>
                <span className="w-6 shrink-0 select-none px-1 py-1 text-center">
                  {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                </span>
                <span className="flex-1 whitespace-pre-wrap break-all px-2 py-1">{line.text}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

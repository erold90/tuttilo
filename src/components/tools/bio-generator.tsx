"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

const TEMPLATES: Record<string, string[]> = {
  professional: [
    "{role} | {specialty} | {years}+ years | {passion}",
    "{role} at {company} | {specialty} | Helping {audience} {benefit}",
    "{passion} enthusiast | {role} | {specialty} specialist | {emoji}",
    "Award-winning {role} | {specialty} expert | Speaker & Author | {emoji}",
  ],
  creative: [
    "{emoji} {role} | Creating {specialty} | {passion} lover | {city}",
    "Making the world more {adjective} | {role} | {emoji} {passion}",
    "{emoji} {passion} | {specialty} | Dreamer & doer | {city}",
    "Here for {passion} & {hobby} | {role} | {emoji}",
  ],
  minimal: [
    "{role} | {city}",
    "{passion}. {specialty}. {emoji}",
    "{role} • {specialty} • {city}",
    "{emoji} {role} | {specialty}",
  ],
  fun: [
    "{emoji} {passion} addict | {role} by day | {hobby} by night",
    "Professional {role} | Amateur {hobby} enthusiast | {emoji}",
    "50% {passion} | 50% {hobby} | 100% {adjective} | {emoji}",
    "{role} who runs on {passion} and {hobby} | {emoji}",
  ],
};

export default function BioGenerator() {
  const t = useTranslations("tools.bio-generator");
  const [fields, setFields] = useState({
    role: "", specialty: "", passion: "", city: "", company: "",
    audience: "", benefit: "", hobby: "", adjective: "", years: "",
    emoji: "✨",
  });
  const [style, setStyle] = useState("professional");
  const [results, setResults] = useState<string[]>([]);

  const updateField = (key: string, value: string) => setFields(prev => ({ ...prev, [key]: value }));

  const generate = useCallback(() => {
    const templates = TEMPLATES[style] || TEMPLATES.professional;
    const generated = templates.map(tmpl => {
      let result = tmpl;
      for (const [key, val] of Object.entries(fields)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, "g"), val || key);
      }
      return result;
    });
    setResults(generated);
  }, [fields, style]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {["role", "specialty", "passion", "city", "company", "hobby", "audience", "benefit", "adjective", "years", "emoji"].map(key => (
          <label key={key} className="block text-sm text-zinc-600 dark:text-zinc-400">
            {t(`ui.${key}`)}
            <input value={fields[key as keyof typeof fields]} onChange={e => updateField(key, e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder={t(`ui.${key}Placeholder`)} />
          </label>
        ))}
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm text-zinc-600 dark:text-zinc-400">{t("ui.style")}
          <select value={style} onChange={e => setStyle(e.target.value)} className="ml-2 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
            <option value="professional">{t("ui.professional")}</option>
            <option value="creative">{t("ui.creative")}</option>
            <option value="minimal">{t("ui.minimal")}</option>
            <option value="fun">{t("ui.fun")}</option>
          </select>
        </label>
        <button onClick={generate} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{t("ui.generate")}</button>
      </div>
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((bio, i) => (
            <div key={i} className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <p className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{bio}</p>
              <button onClick={() => navigator.clipboard.writeText(bio)} className="px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-600 rounded hover:bg-zinc-300 dark:hover:bg-zinc-500 shrink-0">{t("ui.copy")}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

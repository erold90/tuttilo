"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

const TRENDING_SETS: Record<string, string[]> = {
  general: ["trending", "viral", "explore", "instagood", "photooftheday", "love", "beautiful", "happy", "follow", "like"],
  business: ["entrepreneur", "startup", "business", "marketing", "success", "motivation", "smallbusiness", "branding", "growth", "leadership"],
  tech: ["technology", "coding", "developer", "programming", "ai", "machinelearning", "webdev", "javascript", "python", "innovation"],
  fitness: ["fitness", "workout", "gym", "health", "motivation", "bodybuilding", "training", "exercise", "healthy", "fitnessmotivation"],
  food: ["food", "foodie", "cooking", "recipe", "homemade", "yummy", "delicious", "foodphotography", "healthyfood", "instafood"],
  travel: ["travel", "wanderlust", "adventure", "explore", "travelphotography", "vacation", "nature", "travelgram", "trip", "instatravel"],
  photography: ["photography", "photo", "photographer", "photooftheday", "nature", "portrait", "landscape", "streetphotography", "art", "camera"],
};

export default function HashtagGenerator() {
  const t = useTranslations("tools.hashtag-generator");
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("general");
  const [count, setCount] = useState(15);

  const hashtags = useMemo(() => {
    const words = topic.toLowerCase().split(/[\s,]+/).filter(Boolean);
    const base = words.map(w => `#${w.replace(/[^a-zA-Z0-9]/g, "")}`).filter(h => h.length > 1);
    const catTags = (TRENDING_SETS[category] || []).map(t => `#${t}`);
    // Combine topic + category, deduplicate
    const combined = [...new Set([...base, ...catTags])];
    return combined.slice(0, count);
  }, [topic, category, count]);

  const output = hashtags.join(" ");

  return (
    <div className="space-y-4">
      <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.topic")}
        <input value={topic} onChange={e => setTopic(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder={t("ui.topicPlaceholder")} />
      </label>
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm text-zinc-600 dark:text-zinc-400">{t("ui.category")}
          <select value={category} onChange={e => setCategory(e.target.value)} className="ml-2 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
            {Object.keys(TRENDING_SETS).map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </label>
        <label className="text-sm text-zinc-600 dark:text-zinc-400">{t("ui.count")}
          <input type="number" min={5} max={30} value={count} onChange={e => setCount(+e.target.value)} className="ml-2 w-16 px-2 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
      </div>
      {hashtags.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {hashtags.map(h => (
              <span key={h} className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">{h}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigator.clipboard.writeText(output)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{t("ui.copy")}</button>
            <span className="text-sm text-zinc-500 self-center">{hashtags.length} hashtags</span>
          </div>
        </div>
      )}
    </div>
  );
}

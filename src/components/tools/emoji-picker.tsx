"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

const EMOJI_DATA: Record<string, string[]> = {
  smileys: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫥","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥵","🥶","🥴","😵","🤯","🤠","🥳","🥸","😎","🤓","🧐"],
  gestures: ["👋","🤚","🖐","✋","🖖","🫱","🫲","🫳","🫴","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","🫵","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🤝","🙏"],
  hearts: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❤️‍🔥","❤️‍🩹","💕","💞","💓","💗","💖","💘","💝","💟"],
  animals: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜"],
  food: ["🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶","🫑","🌽","🥕","🫒","🧄","🧅","🥔","🍞","🥐","🥖","🫓","🥨","🥯","🧀","🍖","🍗","🥩","🥓","🍔","🍟","🍕","🌭","🥪","🌮","🌯","🫔","🥙"],
  objects: ["⌚","📱","💻","⌨️","🖥","🖨","🖱","🖲","🕹","🗜","💽","💾","💿","📀","📼","📷","📸","📹","🎥","📽","🎞","📞","☎️","📟","📠","📺","📻","🎙","🎚","🎛","🧭","⏱","⏲","⏰","🕰","⌛","⏳","📡","🔋","🔌","💡","🔦","🕯"],
  symbols: ["❤️","💯","💢","💥","💫","💦","💨","🕳","💣","💬","👁‍🗨","🗨","🗯","💭","💤","🔔","🔕","🎵","🎶","✅","❌","⭕","🚫","♻️","✨","⚡","🔥","💧","🌊","🏆","🥇","🥈","🥉","⚽","🏀","🏈","⚾","🎾","🏐"],
  flags: ["🏁","🚩","🎌","🏴","🏳️","🏳️‍🌈","🏳️‍⚧️","🏴‍☠️","🇺🇸","🇬🇧","🇫🇷","🇩🇪","🇮🇹","🇪🇸","🇧🇷","🇯🇵","🇰🇷","🇨🇳","🇮🇳","🇷🇺","🇨🇦","🇦🇺","🇲🇽","🇦🇷"],
};

export default function EmojiPicker() {
  const t = useTranslations("tools.emoji-picker");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("smileys");
  const [copied, setCopied] = useState("");

  const filteredEmojis = useMemo(() => {
    if (!search) return EMOJI_DATA[category] || [];
    return Object.values(EMOJI_DATA).flat();
  }, [search, category]);

  const copyEmoji = (emoji: string) => {
    navigator.clipboard.writeText(emoji);
    setCopied(emoji);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div className="space-y-4">
      <input value={search} onChange={e => setSearch(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder={t("ui.search")} />
      {!search && (
        <div className="flex gap-1 overflow-x-auto">
          {Object.keys(EMOJI_DATA).map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${category === cat ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"}`}>{t(`ui.${cat}`)}</button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-14 gap-1 max-h-80 overflow-y-auto">
        {filteredEmojis.map((emoji, i) => (
          <button key={`${emoji}-${i}`} onClick={() => copyEmoji(emoji)} className={`p-2 text-2xl rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${copied === emoji ? "bg-green-100 dark:bg-green-900/30" : ""}`} title={t("ui.clickToCopy")}>{emoji}</button>
        ))}
      </div>
      {copied && <p className="text-sm text-green-600 text-center">{t("ui.copied")} {copied}</p>}
    </div>
  );
}

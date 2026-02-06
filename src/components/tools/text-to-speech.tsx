"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";

export function TextToSpeech() {
  const t = useTranslations("tools.text-to-speech.ui");
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      setVoices(v);
      if (v.length > 0 && !selectedVoice) {
        const defaultV = v.find((voice) => voice.default) || v[0];
        setSelectedVoice(defaultV.name);
      }
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => { speechSynthesis.onvoiceschanged = null; };
  }, [selectedVoice]);

  const speak = useCallback(() => {
    if (!text.trim()) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    speechSynthesis.speak(utterance);
  }, [text, selectedVoice, rate, pitch, voices]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("placeholder")}
          className="w-full h-40 rounded-lg border border-border bg-background p-4 text-sm focus:border-primary focus:outline-none resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">{text.length} {t("characters")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">{t("voice")}</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">{t("rate")}: {rate.toFixed(1)}x</label>
            <input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t("pitch")}: {pitch.toFixed(1)}</label>
            <input type="range" min={0.5} max={2} step={0.1} value={pitch} onChange={(e) => setPitch(Number(e.target.value))} className="w-full" />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {!speaking ? (
          <button onClick={speak} disabled={!text.trim()} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {t("speak")}
          </button>
        ) : (
          <button onClick={stop} className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600">
            {t("stop")}
          </button>
        )}
      </div>
    </div>
  );
}

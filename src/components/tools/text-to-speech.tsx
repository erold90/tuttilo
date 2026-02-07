"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";

const LANG_NAMES: Record<string, string> = {
  ar: "العربية", bg: "Български", ca: "Català", cs: "Čeština", cy: "Cymraeg",
  da: "Dansk", de: "Deutsch", el: "Ελληνικά", en: "English", es: "Español",
  et: "Eesti", fi: "Suomi", fr: "Français", ga: "Gaeilge", gl: "Galego",
  he: "עברית", hi: "हिन्दी", hr: "Hrvatski", hu: "Magyar", id: "Bahasa Indonesia",
  is: "Íslenska", it: "Italiano", ja: "日本語", ko: "한국어", lt: "Lietuvių",
  lv: "Latviešu", ms: "Bahasa Melayu", nb: "Norsk Bokmål", nl: "Nederlands",
  no: "Norsk", pl: "Polski", pt: "Português", ro: "Română",
  ru: "Русский", sk: "Slovenčina", sl: "Slovenščina", sq: "Shqip", sr: "Српски",
  sv: "Svenska", ta: "தமிழ்", te: "తెలుగు", th: "ไทย", tr: "Türkçe",
  uk: "Українська", vi: "Tiếng Việt", zh: "中文",
};

function getLangBase(lang: string) {
  return lang.split("-")[0].split("_")[0].toLowerCase();
}

function getLangLabel(lang: string) {
  const base = getLangBase(lang);
  const name = LANG_NAMES[base] || base.toUpperCase();
  const parts = lang.split(/[-_]/);
  if (parts.length > 1) return `${name} (${parts.slice(1).join("-").toUpperCase()})`;
  return name;
}

export function TextToSpeech() {
  const t = useTranslations("tools.text-to-speech.ui");
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedLang, setSelectedLang] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      setVoices(v);
      if (v.length > 0 && !selectedLang) {
        const browserLang = getLangBase(navigator.language);
        const match = v.find((voice) => getLangBase(voice.lang) === browserLang);
        const defaultV = match || v.find((voice) => voice.default) || v[0];
        setSelectedLang(defaultV.lang);
        setSelectedVoice(defaultV.name);
      }
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => { speechSynthesis.onvoiceschanged = null; };
  }, [selectedLang]);

  // Group voices by language code
  const languages = useMemo(() => {
    const langMap = new Map<string, SpeechSynthesisVoice[]>();
    for (const v of voices) {
      const arr = langMap.get(v.lang) || [];
      arr.push(v);
      langMap.set(v.lang, arr);
    }
    return Array.from(langMap.entries()).sort((a, b) =>
      getLangLabel(a[0]).localeCompare(getLangLabel(b[0]))
    );
  }, [voices]);

  // Voices filtered by selected language
  const filteredVoices = useMemo(() => {
    if (!selectedLang) return voices;
    return voices.filter((v) => v.lang === selectedLang);
  }, [voices, selectedLang]);

  const handleLangChange = useCallback((lang: string) => {
    setSelectedLang(lang);
    const langVoices = voices.filter((v) => v.lang === lang);
    if (langVoices.length > 0) setSelectedVoice(langVoices[0].name);
  }, [voices]);

  // Create an utterance with current settings
  const createUtterance = useCallback((onEnd?: () => void) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => { setSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setSpeaking(false); onEnd?.(); };
    return utterance;
  }, [text, selectedVoice, rate, pitch, voices]);

  const speak = useCallback(() => {
    if (!text.trim()) return;
    speechSynthesis.cancel();
    speechSynthesis.speak(createUtterance());
  }, [text, createUtterance]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setSpeaking(false);
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  // Record tab audio via getDisplayMedia while speaking, then offer download
  const recordAndDownload = useCallback(async () => {
    if (!text.trim()) return;
    if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); }

    speechSynthesis.cancel();
    setRecording(true);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true, // some browsers require video
        preferCurrentTab: true,
        selfBrowserSurface: "include",
        surfaceSwitching: "exclude",
      } as unknown as DisplayMediaStreamOptions);

      // Discard video tracks immediately
      stream.getVideoTracks().forEach((t) => t.stop());

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        speak();
        return;
      }

      const audioStream = new MediaStream(audioTracks);
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus" : "audio/webm";
      const recorder = new MediaRecorder(audioStream, { mimeType });
      recorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        if (blob.size > 0) setAudioUrl(URL.createObjectURL(blob));
        setRecording(false);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();

      // Speak while recording
      const utterance = createUtterance(() => {
        setTimeout(() => {
          if (recorder.state === "recording") recorder.stop();
        }, 400);
      });
      speechSynthesis.speak(utterance);
    } catch {
      setRecording(false);
    }
  }, [text, audioUrl, createUtterance, speak]);

  const saveFile = useCallback(() => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "speech.webm";
    a.click();
  }, [audioUrl]);

  return (
    <div className="space-y-6">
      {/* Text input */}
      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("placeholder")}
          className="w-full h-40 rounded-lg border border-border bg-background p-4 text-sm focus:border-primary focus:outline-none resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">{text.length} {t("characters")}</p>
      </div>

      {/* Language + Voice */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">{t("language")}</label>
          <select
            value={selectedLang}
            onChange={(e) => handleLangChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {languages.map(([lang]) => (
              <option key={lang} value={lang}>{getLangLabel(lang)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("voice")}</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {filteredVoices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name.replace(/^(Google|Microsoft|Apple)\s+/i, "")}
                {v.localService ? "" : " \u2601"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rate + Pitch */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium mb-1">{t("rate")}: {rate.toFixed(1)}x</label>
          <input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-primary" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t("pitch")}: {pitch.toFixed(1)}</label>
          <input type="range" min={0.5} max={2} step={0.1} value={pitch} onChange={(e) => setPitch(Number(e.target.value))} className="w-full accent-primary" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {!speaking ? (
          <button onClick={speak} disabled={!text.trim() || recording} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            &#9654; {t("speak")}
          </button>
        ) : (
          <button onClick={stop} className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600">
            &#9632; {t("stop")}
          </button>
        )}
        <button
          onClick={recordAndDownload}
          disabled={!text.trim() || recording || speaking}
          className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50 flex items-center gap-1.5"
          title={t("downloadHint")}
        >
          {recording ? (
            <><span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" /> {t("recording")}</>
          ) : (
            <>{t("download")}</>
          )}
        </button>
      </div>

      {/* Recording hint */}
      {recording && (
        <p className="text-xs text-muted-foreground text-center animate-pulse">{t("recordingActive")}</p>
      )}

      {/* Audio result */}
      {audioUrl && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <audio controls src={audioUrl} className="w-full" />
          <button
            onClick={saveFile}
            className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
          >
            {t("saveFile")}
          </button>
        </div>
      )}
    </div>
  );
}

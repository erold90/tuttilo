"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";

interface ParsedUA {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  engine: string;
  mobile: boolean;
}

function parseUserAgent(ua: string): ParsedUA {
  const result: ParsedUA = { browser: "Unknown", browserVersion: "", os: "Unknown", osVersion: "", device: "Desktop", engine: "Unknown", mobile: false };

  // Browser detection
  if (ua.includes("Firefox/")) { result.browser = "Firefox"; result.browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || ""; result.engine = "Gecko"; }
  else if (ua.includes("Edg/")) { result.browser = "Edge"; result.browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || ""; result.engine = "Blink"; }
  else if (ua.includes("OPR/") || ua.includes("Opera")) { result.browser = "Opera"; result.browserVersion = ua.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] || ""; result.engine = "Blink"; }
  else if (ua.includes("Chrome/")) { result.browser = "Chrome"; result.browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || ""; result.engine = "Blink"; }
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) { result.browser = "Safari"; result.browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || ""; result.engine = "WebKit"; }
  else if (ua.includes("MSIE") || ua.includes("Trident")) { result.browser = "Internet Explorer"; result.browserVersion = ua.match(/(?:MSIE |rv:)([\d.]+)/)?.[1] || ""; result.engine = "Trident"; }

  // OS detection
  if (ua.includes("Windows NT")) { result.os = "Windows"; const v = ua.match(/Windows NT ([\d.]+)/)?.[1]; result.osVersion = v === "10.0" ? "10/11" : v === "6.3" ? "8.1" : v === "6.1" ? "7" : v || ""; }
  else if (ua.includes("Mac OS X")) { result.os = "macOS"; result.osVersion = (ua.match(/Mac OS X ([\d_.]+)/)?.[1] || "").replace(/_/g, "."); }
  else if (ua.includes("Android")) { result.os = "Android"; result.osVersion = ua.match(/Android ([\d.]+)/)?.[1] || ""; }
  else if (ua.includes("iPhone") || ua.includes("iPad")) { result.os = "iOS"; result.osVersion = (ua.match(/OS ([\d_]+)/)?.[1] || "").replace(/_/g, "."); }
  else if (ua.includes("Linux")) { result.os = "Linux"; result.osVersion = ""; }
  else if (ua.includes("CrOS")) { result.os = "Chrome OS"; }

  // Device
  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) { result.device = "Mobile"; result.mobile = true; }
  else if (ua.includes("iPad") || ua.includes("Tablet")) { result.device = "Tablet"; result.mobile = true; }
  else result.device = "Desktop";

  return result;
}

export default function UserAgentParser() {
  const t = useTranslations("tools.user-agent-parser");
  const [ua, setUa] = useState("");
  const [parsed, setParsed] = useState<ParsedUA | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setUa(navigator.userAgent);
    }
  }, []);

  const parse = useCallback(() => {
    setParsed(parseUserAgent(ua));
  }, [ua]);

  useEffect(() => { if (ua) parse(); }, [ua, parse]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {t("ui.userAgent")}
        <textarea value={ua} onChange={e => setUa(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono" />
      </label>
      <button onClick={parse} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.parse")}</button>
      {parsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            ["browser", `${parsed.browser} ${parsed.browserVersion}`],
            ["os", `${parsed.os} ${parsed.osVersion}`],
            ["device", parsed.device],
            ["engine", parsed.engine],
            ["mobile", parsed.mobile ? "Yes" : "No"],
          ] as [string, string][]).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{t(`ui.${key}`)}</span>
              <span className="text-sm font-mono text-zinc-900 dark:text-zinc-100">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

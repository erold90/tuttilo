"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface HeaderPair { key: string; value: string; }
interface ApiResponse { status: number; statusText: string; headers: Record<string, string>; body: string; time: number; }

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export default function ApiTester() {
  const t = useTranslations("tools.api-tester");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState<HeaderPair[]>([{ key: "Content-Type", value: "application/json" }]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addHeader = useCallback(() => {
    setHeaders(prev => [...prev, { key: "", value: "" }]);
  }, []);

  const removeHeader = useCallback((idx: number) => {
    setHeaders(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const updateHeader = useCallback((idx: number, field: "key" | "value", val: string) => {
    setHeaders(prev => prev.map((h, i) => i === idx ? { ...h, [field]: val } : h));
  }, []);

  const sendRequest = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResponse(null);
    const start = performance.now();
    try {
      const reqHeaders: Record<string, string> = {};
      for (const h of headers) {
        if (h.key.trim()) reqHeaders[h.key.trim()] = h.value;
      }
      const hasBody = ["POST", "PUT", "PATCH"].includes(method);
      const res = await fetch(url, {
        method,
        headers: reqHeaders,
        body: hasBody && body ? body : undefined,
      });
      const time = Math.round(performance.now() - start);
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });
      let resBody = "";
      try { resBody = await res.text(); } catch {}
      // Try to format JSON
      try { resBody = JSON.stringify(JSON.parse(resBody), null, 2); } catch {}
      setResponse({ status: res.status, statusText: res.statusText, headers: resHeaders, body: resBody, time });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      setResponse(null);
    }
    setLoading(false);
  }, [url, method, headers, body]);

  const statusColor = response
    ? response.status < 300 ? "text-green-600" : response.status < 400 ? "text-yellow-600" : "text-red-600"
    : "";

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select value={method} onChange={e => setMethod(e.target.value)} className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-bold">
          {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono" />
        <button onClick={sendRequest} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? "..." : t("ui.send")}
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.headers")}</label>
          <button onClick={addHeader} className="text-xs text-blue-500 hover:text-blue-600">+ {t("ui.addHeader")}</button>
        </div>
        <div className="space-y-1">
          {headers.map((h, i) => (
            <div key={i} className="flex gap-1">
              <input type="text" value={h.key} onChange={e => updateHeader(i, "key", e.target.value)} placeholder="Key" className="w-1/3 px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-xs font-mono" />
              <input type="text" value={h.value} onChange={e => updateHeader(i, "value", e.target.value)} placeholder="Value" className="flex-1 px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-xs font-mono" />
              <button onClick={() => removeHeader(i)} className="px-2 text-red-400 hover:text-red-600 text-sm">x</button>
            </div>
          ))}
        </div>
      </div>

      {["POST", "PUT", "PATCH"].includes(method) && (
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("ui.body")}
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder='{"key": "value"}' className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono" />
        </label>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {response && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className={`text-lg font-bold ${statusColor}`}>{response.status} {response.statusText}</span>
            <span className="text-sm text-zinc-500">{response.time}ms</span>
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer text-zinc-600 dark:text-zinc-400 font-medium">{t("ui.responseHeaders")} ({Object.keys(response.headers).length})</summary>
            <div className="mt-1 space-y-0.5">
              {Object.entries(response.headers).map(([k, v]) => (
                <div key={k} className="font-mono text-xs"><span className="text-zinc-500">{k}:</span> {v}</div>
              ))}
            </div>
          </details>
          <div className="relative">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("ui.responseBody")}</label>
            <pre className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto">{response.body}</pre>
            <button onClick={() => navigator.clipboard.writeText(response.body)} className="absolute top-8 right-2 text-xs text-blue-500 hover:text-blue-600">{t("ui.copy")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

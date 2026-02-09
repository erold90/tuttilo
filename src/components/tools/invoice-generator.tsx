"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

interface InvoiceItem { description: string; quantity: number; price: number; }

export default function InvoiceGenerator() {
  const t = useTranslations("tools.invoice-generator");
  const previewRef = useRef<HTMLDivElement>(null);
  const [from, setFrom] = useState({ name: "", email: "", address: "" });
  const [to, setTo] = useState({ name: "", email: "", address: "" });
  const [invoiceNo, setInvoiceNo] = useState("INV-001");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", quantity: 1, price: 0 }]);
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState(0);

  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

  const addItem = () => setItems([...items, { description: "", quantity: 1, price: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, j) => j !== i));
  const updateItem = (i: number, field: keyof InvoiceItem, value: string | number) => {
    const n = [...items]; n[i] = { ...n[i], [field]: value }; setItems(n);
  };

  const printInvoice = useCallback(() => {
    const el = previewRef.current;
    if (!el) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Invoice ${invoiceNo}</title><style>body{font-family:system-ui;padding:40px;max-width:800px;margin:0 auto}table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #e5e7eb}th{background:#f9fafb;font-weight:600}.text-right{text-align:right}.total{font-size:1.2em;font-weight:700}</style></head><body>${el.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  }, [invoiceNo]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">{t("ui.from")}</h3>
          <input placeholder={t("ui.businessName")} value={from.name} onChange={e => setFrom({ ...from, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
          <input placeholder={t("ui.emailLabel")} value={from.email} onChange={e => setFrom({ ...from, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
          <textarea placeholder={t("ui.addressLabel")} value={from.address} onChange={e => setFrom({ ...from, address: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">{t("ui.to")}</h3>
          <input placeholder={t("ui.clientName")} value={to.name} onChange={e => setTo({ ...to, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
          <input placeholder={t("ui.emailLabel")} value={to.email} onChange={e => setTo({ ...to, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
          <textarea placeholder={t("ui.addressLabel")} value={to.address} onChange={e => setTo({ ...to, address: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.invoiceNo")}
          <input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.date")}
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.dueDate")}
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.currency")}
          <select value={currency} onChange={e => setCurrency(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
            {["USD","EUR","GBP","JPY","CAD","AUD","CHF","CNY","INR","BRL"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">{t("ui.items")}</h3>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input placeholder={t("ui.itemDesc")} value={item.description} onChange={e => updateItem(i, "description", e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
            <input type="number" min={1} value={item.quantity} onChange={e => updateItem(i, "quantity", +e.target.value)} className="w-20 px-2 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-center" />
            <input type="number" min={0} step={0.01} value={item.price} onChange={e => updateItem(i, "price", +e.target.value)} className="w-28 px-2 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-right" />
            {items.length > 1 && <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 px-2">&times;</button>}
          </div>
        ))}
        <button onClick={addItem} className="text-sm text-blue-600 hover:underline">+ {t("ui.addItem")}</button>
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.taxRate")}:
          <input type="number" min={0} max={100} step={0.5} value={taxRate} onChange={e => setTaxRate(+e.target.value)} className="ml-2 w-20 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />%
        </label>
      </div>

      <div ref={previewRef} className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
        <div className="flex justify-between mb-6">
          <div><h2 className="text-2xl font-bold">INVOICE</h2><p className="text-sm text-zinc-500">{invoiceNo}</p></div>
          <div className="text-right text-sm"><p>{t("ui.date")}: {date}</p>{dueDate && <p>{t("ui.dueDate")}: {dueDate}</p>}</div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div><p className="font-semibold mb-1">{t("ui.from")}:</p><p className="whitespace-pre-line">{from.name}{from.email && `\n${from.email}`}{from.address && `\n${from.address}`}</p></div>
          <div><p className="font-semibold mb-1">{t("ui.to")}:</p><p className="whitespace-pre-line">{to.name}{to.email && `\n${to.email}`}{to.address && `\n${to.address}`}</p></div>
        </div>
        <table className="w-full text-sm mb-4">
          <thead><tr className="border-b-2 border-zinc-300"><th className="text-left py-2">{t("ui.itemDesc")}</th><th className="text-right py-2">{t("ui.qty")}</th><th className="text-right py-2">{t("ui.price")}</th><th className="text-right py-2">{t("ui.amount")}</th></tr></thead>
          <tbody>{items.map((item, i) => (<tr key={i} className="border-b border-zinc-200"><td className="py-2">{item.description || "-"}</td><td className="text-right py-2">{item.quantity}</td><td className="text-right py-2">{fmt(item.price)}</td><td className="text-right py-2">{fmt(item.quantity * item.price)}</td></tr>))}</tbody>
        </table>
        <div className="text-right space-y-1 text-sm">
          <p>{t("ui.subtotal")}: {fmt(subtotal)}</p>
          {taxRate > 0 && <p>{t("ui.tax")} ({taxRate}%): {fmt(tax)}</p>}
          <p className="text-lg font-bold">{t("ui.total")}: {fmt(total)}</p>
        </div>
      </div>

      <button onClick={printInvoice} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.print")}</button>
    </div>
  );
}

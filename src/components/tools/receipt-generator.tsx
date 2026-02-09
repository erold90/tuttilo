"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

interface ReceiptItem { name: string; qty: number; price: number; }

export default function ReceiptGenerator() {
  const t = useTranslations("tools.receipt-generator");
  const previewRef = useRef<HTMLDivElement>(null);
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [receiptNo, setReceiptNo] = useState(`RCP-${Date.now().toString(36).toUpperCase()}`);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<ReceiptItem[]>([{ name: "", qty: 1, price: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const addItem = () => setItems([...items, { name: "", qty: 1, price: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, j) => j !== i));
  const updateItem = (i: number, field: keyof ReceiptItem, value: string | number) => {
    const n = [...items]; n[i] = { ...n[i], [field]: value }; setItems(n);
  };

  const printReceipt = useCallback(() => {
    const el = previewRef.current;
    if (!el) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Receipt ${receiptNo}</title><style>body{font-family:monospace;padding:20px;max-width:320px;margin:0 auto;font-size:12px}h2{text-align:center;margin:0}p{margin:2px 0}.line{border-top:1px dashed #000;margin:8px 0}.row{display:flex;justify-content:space-between}.total{font-weight:bold;font-size:14px}</style></head><body>${el.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  }, [receiptNo]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input placeholder={t("ui.storeName")} value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        <input placeholder={t("ui.storeAddress")} value={storeAddress} onChange={e => setStoreAddress(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.receiptNo")}:
          <input value={receiptNo} onChange={e => setReceiptNo(e.target.value)} className="ml-2 w-40 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.date")}:
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="ml-2 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">{t("ui.items")}</h3>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input placeholder={t("ui.itemName")} value={item.name} onChange={e => updateItem(i, "name", e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
            <input type="number" min={1} value={item.qty} onChange={e => updateItem(i, "qty", +e.target.value)} className="w-16 px-2 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-center" />
            <input type="number" min={0} step={0.01} value={item.price} onChange={e => updateItem(i, "price", +e.target.value)} className="w-24 px-2 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-right" />
            {items.length > 1 && <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 px-2">&times;</button>}
          </div>
        ))}
        <button onClick={addItem} className="text-sm text-blue-600 hover:underline">+ {t("ui.addItem")}</button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.taxRate")}:
          <input type="number" min={0} max={100} step={0.5} value={taxRate} onChange={e => setTaxRate(+e.target.value)} className="ml-2 w-20 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />%
        </label>
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
          <option value="cash">{t("ui.cash")}</option>
          <option value="card">{t("ui.card")}</option>
          <option value="transfer">{t("ui.transfer")}</option>
        </select>
      </div>

      <div ref={previewRef} className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 max-w-xs mx-auto font-mono text-xs text-zinc-900 dark:text-zinc-100">
        <h2 className="text-center text-base font-bold mb-1">{storeName || t("ui.storeName")}</h2>
        {storeAddress && <p className="text-center text-[10px] text-zinc-500 mb-2">{storeAddress}</p>}
        <div className="border-t border-dashed border-zinc-400 my-2" />
        <div className="flex justify-between"><span>#{receiptNo}</span><span>{date}</span></div>
        <div className="border-t border-dashed border-zinc-400 my-2" />
        {items.map((item, i) => (
          <div key={i} className="flex justify-between py-0.5">
            <span>{item.name || "-"} x{item.qty}</span>
            <span>{fmt(item.qty * item.price)}</span>
          </div>
        ))}
        <div className="border-t border-dashed border-zinc-400 my-2" />
        <div className="flex justify-between"><span>{t("ui.subtotal")}</span><span>{fmt(subtotal)}</span></div>
        {taxRate > 0 && <div className="flex justify-between"><span>{t("ui.tax")} ({taxRate}%)</span><span>{fmt(tax)}</span></div>}
        <div className="flex justify-between font-bold text-sm mt-1"><span>{t("ui.total")}</span><span>{fmt(total)}</span></div>
        <div className="border-t border-dashed border-zinc-400 my-2" />
        <p className="text-center text-[10px]">{t("ui.paymentMethod")}: {t(`ui.${paymentMethod}`)}</p>
        <p className="text-center text-[10px] mt-2">{t("ui.thankYou")}</p>
      </div>

      <div className="text-center">
        <button onClick={printReceipt} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.print")}</button>
      </div>
    </div>
  );
}

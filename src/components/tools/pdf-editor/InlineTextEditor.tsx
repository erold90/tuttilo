import { useRef, useEffect, useCallback } from "react";
import type { TextInfo } from "./types";

interface InlineTextEditorProps {
  item: TextInfo;
  value: string;
  fontSize: number;
  onChange: (text: string) => void;
  onSizeChange: (size: number) => void;
  onClose: () => void;
  scale: number;
}

export function InlineTextEditor({
  item,
  value,
  fontSize,
  onChange,
  onSizeChange,
  onClose,
  scale,
}: InlineTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const initialValue = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = value;
    // Place cursor at end
    const range = document.createRange();
    const sel = window.getSelection();
    if (el.childNodes.length > 0) {
      range.setStartAfter(el.lastChild!);
    } else {
      range.setStart(el, 0);
    }
    range.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(range);
    el.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    onChange(el.textContent || "");
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        onClose();
      }
      // Font size shortcuts: Ctrl+] / Ctrl+[
      if ((e.metaKey || e.ctrlKey) && e.key === "]") {
        e.preventDefault();
        onSizeChange(fontSize + 1);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "[") {
        e.preventDefault();
        onSizeChange(Math.max(6, fontSize - 1));
      }
    },
    [onClose, onSizeChange, fontSize]
  );

  const scaledFontSize = fontSize * scale;
  const fontStyle = item.isItalic ? "italic" : "normal";
  const fontWeight = item.isBold ? 700 : 400;
  const fontFamily =
    item.fontFamily === "serif"
      ? "serif"
      : item.fontFamily === "monospace"
        ? "monospace"
        : "sans-serif";

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onBlur={onClose}
      spellCheck={false}
      style={{
        position: "absolute",
        left: item.vx,
        top: item.vy,
        minWidth: Math.max(item.vw, 40),
        height: item.vh,
        fontSize: scaledFontSize,
        lineHeight: `${item.vh}px`,
        fontFamily,
        fontWeight,
        fontStyle,
        color: "transparent",
        caretColor: "#4F46E5",
        background: "rgba(99, 102, 241, 0.08)",
        border: "2px solid #6366F1",
        borderRadius: 2,
        outline: "none",
        padding: 0,
        margin: 0,
        whiteSpace: "pre",
        overflow: "visible",
        zIndex: 10,
        boxSizing: "border-box",
        cursor: "text",
      }}
    />
  );
}

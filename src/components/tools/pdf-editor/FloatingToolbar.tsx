import { useRef, useEffect, useState } from "react";

interface FloatingToolbarProps {
  x: number;
  y: number;
  containerRect: DOMRect | null;
  fontSize: number;
  color: string;
  isBold?: boolean;
  isItalic?: boolean;
  showDelete?: boolean;
  onFontSizeChange: (size: number) => void;
  onColorChange: (color: string) => void;
  onDelete?: () => void;
  t: (key: string) => string;
}

export function FloatingToolbar({
  x,
  y,
  containerRect,
  fontSize,
  color,
  showDelete,
  onFontSizeChange,
  onColorChange,
  onDelete,
  t,
}: FloatingToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y - 44 });

  useEffect(() => {
    const el = ref.current;
    if (!el || !containerRect) return;
    const elW = el.offsetWidth;
    let left = x - elW / 2;
    let top = y - 44;

    // Clamp horizontal
    if (left < 0) left = 4;
    if (left + elW > containerRect.width) left = containerRect.width - elW - 4;

    // If above viewport, show below instead
    if (top < 0) top = y + 30;

    setPos({ left, top });
  }, [x, y, containerRect]);

  return (
    <div
      ref={ref}
      className="absolute flex items-center gap-1 bg-background border rounded-lg shadow-lg px-2 py-1"
      style={{
        left: pos.left,
        top: pos.top,
        zIndex: 20,
        pointerEvents: "auto",
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Font size controls */}
      <button
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-sm font-bold"
        onClick={() => onFontSizeChange(Math.max(6, fontSize - 1))}
        title={t("fontSize")}
      >
        A−
      </button>
      <span className="text-xs min-w-[28px] text-center tabular-nums">
        {Math.round(fontSize)}
      </span>
      <button
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-sm font-bold"
        onClick={() => onFontSizeChange(fontSize + 1)}
        title={t("fontSize")}
      >
        A+
      </button>

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Color picker */}
      <label className="relative w-7 h-7 flex items-center justify-center rounded hover:bg-muted cursor-pointer" title={t("color")}>
        <div
          className="w-4 h-4 rounded-full border border-border"
          style={{ backgroundColor: color }}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>

      {showDelete && (
        <>
          <div className="w-px h-5 bg-border mx-0.5" />
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-destructive/10 text-destructive text-sm"
            onClick={onDelete}
            title={t("deleteAnnotation")}
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}

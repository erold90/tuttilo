import { useRef, useCallback, useState } from "react";
import type { TextAnnotation } from "./types";

interface DraggableAnnotationProps {
  annotation: TextAnnotation;
  scale: number;
  pageH: number;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (id: string, pdfX: number, pdfY: number) => void;
  onEdit: (id: string, text: string) => void;
  onSizeChange: (id: string, size: number) => void;
}

export function DraggableAnnotation({
  annotation,
  scale,
  pageH,
  isSelected,
  onSelect,
  onMove,
  onEdit,
  onSizeChange,
}: DraggableAnnotationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const [editing, setEditing] = useState(false);

  const cx = annotation.pdfX * scale;
  const cy = (pageH - annotation.pdfY) * scale;
  const fs = annotation.fontSize * scale;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (editing) return;
      e.stopPropagation();
      e.preventDefault();
      onSelect();
      dragging.current = true;
      const el = ref.current!;
      const rect = el.getBoundingClientRect();
      offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      el.setPointerCapture(e.pointerId);
    },
    [onSelect, editing]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const parent = ref.current?.parentElement;
      if (!parent) return;
      const pRect = parent.getBoundingClientRect();
      const newLeft = e.clientX - pRect.left - offset.current.x;
      const newTop = e.clientY - pRect.top - offset.current.y;
      const el = ref.current!;
      el.style.left = `${newLeft}px`;
      el.style.top = `${newTop}px`;
    },
    []
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      ref.current?.releasePointerCapture(e.pointerId);
      const parent = ref.current?.parentElement;
      if (!parent) return;
      const pRect = parent.getBoundingClientRect();
      const el = ref.current!;
      const newLeft = parseFloat(el.style.left);
      const newTop = parseFloat(el.style.top) + fs;
      const pdfX = newLeft / scale;
      const pdfY = pageH - newTop / scale;
      onMove(annotation.id, pdfX, pdfY);
    },
    [annotation.id, scale, pageH, fs, onMove]
  );

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setEditing(false);
    const el = ref.current;
    if (el) {
      const text = el.textContent || "";
      if (text !== annotation.text) onEdit(annotation.id, text);
    }
  }, [annotation.id, annotation.text, onEdit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        setEditing(false);
        const el = ref.current;
        if (el) {
          const text = el.textContent || "";
          if (text !== annotation.text) onEdit(annotation.id, text);
        }
      }
    },
    [annotation.id, annotation.text, onEdit]
  );

  // Resize handle
  const handleResizeDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const startY = e.clientY;
      const startSize = annotation.fontSize;
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        const dy = startY - ev.clientY;
        const newSize = Math.max(6, Math.round(startSize + dy / scale));
        onSizeChange(annotation.id, newSize);
      };
      const onUp = () => {
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerup", onUp);
      };
      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", onUp);
    },
    [annotation.id, annotation.fontSize, scale, onSizeChange]
  );

  return (
    <div
      ref={ref}
      contentEditable={editing}
      suppressContentEditableWarning
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onBlur={editing ? handleBlur : undefined}
      onKeyDown={editing ? handleKeyDown : undefined}
      spellCheck={false}
      style={{
        position: "absolute",
        left: cx,
        top: cy - fs,
        fontSize: fs,
        lineHeight: 1.2,
        fontFamily: "sans-serif",
        color: annotation.color || "#000",
        whiteSpace: "pre",
        cursor: editing ? "text" : "grab",
        zIndex: isSelected ? 12 : 5,
        outline: isSelected ? "2px solid #6366F1" : "1px dashed rgba(99,102,241,0.4)",
        outlineOffset: 2,
        borderRadius: 2,
        padding: "0 2px",
        background: isSelected ? "rgba(99,102,241,0.06)" : "transparent",
        userSelect: editing ? "text" : "none",
        touchAction: "none",
      }}
    >
      {annotation.text}
      {isSelected && !editing && (
        <div
          onPointerDown={handleResizeDown}
          style={{
            position: "absolute",
            right: -4,
            bottom: -4,
            width: 8,
            height: 8,
            borderRadius: 2,
            background: "#6366F1",
            cursor: "ns-resize",
          }}
        />
      )}
    </div>
  );
}

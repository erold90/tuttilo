import { useRef, useCallback } from "react";
import type { ImageAnnotation as ImageAnnotationType } from "./types";

interface ImageAnnotationProps {
  image: ImageAnnotationType;
  scale: number;
  pageH: number;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (id: string, pdfX: number, pdfY: number) => void;
  onResize: (id: string, width: number, height: number) => void;
}

export function ImageAnnotationEl({
  image,
  scale,
  pageH,
  isSelected,
  onSelect,
  onMove,
  onResize,
}: ImageAnnotationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const cx = image.pdfX * scale;
  const cy = (pageH - image.pdfY) * scale;
  const w = image.width * scale;
  const h = image.height * scale;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onSelect();
      dragging.current = true;
      const el = ref.current!;
      const rect = el.getBoundingClientRect();
      offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      el.setPointerCapture(e.pointerId);
    },
    [onSelect]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const pRect = parent.getBoundingClientRect();
    const el = ref.current!;
    el.style.left = `${e.clientX - pRect.left - offset.current.x}px`;
    el.style.top = `${e.clientY - pRect.top - offset.current.y}px`;
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      ref.current?.releasePointerCapture(e.pointerId);
      const parent = ref.current?.parentElement;
      if (!parent) return;
      const el = ref.current!;
      const newLeft = parseFloat(el.style.left);
      const newTop = parseFloat(el.style.top) + h;
      const pdfX = newLeft / scale;
      const pdfY = pageH - newTop / scale;
      onMove(image.id, pdfX, pdfY);
    },
    [image.id, scale, pageH, h, onMove]
  );

  // Corner resize
  const handleResizeDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const startX = e.clientX;
      const startW = image.width;
      const startH = image.height;
      const aspect = startW / startH;
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const onMoveEv = (ev: PointerEvent) => {
        const dx = (ev.clientX - startX) / scale;
        const newW = Math.max(20, startW + dx);
        const newH = newW / aspect;
        onResize(image.id, newW, newH);
      };
      const onUp = () => {
        target.removeEventListener("pointermove", onMoveEv);
        target.removeEventListener("pointerup", onUp);
      };
      target.addEventListener("pointermove", onMoveEv);
      target.addEventListener("pointerup", onUp);
    },
    [image.id, image.width, image.height, scale, onResize]
  );

  return (
    <div
      ref={ref}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: "absolute",
        left: cx,
        top: cy - h,
        width: w,
        height: h,
        cursor: "grab",
        zIndex: isSelected ? 12 : 5,
        outline: isSelected ? "2px solid #6366F1" : "1px dashed rgba(99,102,241,0.3)",
        outlineOffset: 1,
        touchAction: "none",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.dataUrl}
        alt=""
        draggable={false}
        style={{ width: "100%", height: "100%", objectFit: "fill", pointerEvents: "none" }}
      />
      {isSelected && (
        <div
          onPointerDown={handleResizeDown}
          style={{
            position: "absolute",
            right: -5,
            bottom: -5,
            width: 10,
            height: 10,
            borderRadius: 2,
            background: "#6366F1",
            cursor: "nwse-resize",
            border: "1px solid white",
          }}
        />
      )}
    </div>
  );
}

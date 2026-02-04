export interface TextInfo {
  idx: number;
  str: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  ascent: number;
  descent: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  vw: number;
  vh: number;
}

export interface TextAnnotation {
  id: string;
  text: string;
  pdfX: number;
  pdfY: number;
  fontSize: number;
  color: string;
  page: number;
}

export interface DrawStroke {
  points: { pdfX: number; pdfY: number }[];
  width: number;
  color: string;
  page: number;
}

export interface ImageAnnotation {
  id: string;
  dataUrl: string;
  pdfX: number;
  pdfY: number;
  width: number;
  height: number;
  page: number;
  naturalW: number;
  naturalH: number;
}

export type EditorMode = "select" | "text" | "draw" | "image";

export type EditorAction =
  | { type: "editText"; key: string; oldText: string; newText: string }
  | { type: "editSize"; key: string; oldSize: number; newSize: number }
  | { type: "addAnnotation"; annotation: TextAnnotation }
  | { type: "removeAnnotation"; id: string; annotation: TextAnnotation }
  | { type: "moveAnnotation"; id: string; oldX: number; oldY: number; newX: number; newY: number }
  | { type: "addStroke"; stroke: DrawStroke }
  | { type: "removeStroke"; index: number; stroke: DrawStroke }
  | { type: "addImage"; image: ImageAnnotation }
  | { type: "removeImage"; id: string; image: ImageAnnotation }
  | { type: "moveImage"; id: string; oldX: number; oldY: number; newX: number; newY: number }
  | { type: "resizeImage"; id: string; oldW: number; oldH: number; newW: number; newH: number };

export interface PdfEditorProps {
  file: File;
  rawBytes: ArrayBuffer;
  onReset: () => void;
}

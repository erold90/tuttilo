"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface ExifTag { name: string; value: string; }

const EXIF_TAGS: Record<number, string> = {
  0x010F: "Make", 0x0110: "Model", 0x0112: "Orientation",
  0x011A: "XResolution", 0x011B: "YResolution", 0x0128: "ResolutionUnit",
  0x0131: "Software", 0x0132: "DateTime", 0x013B: "Artist",
  0x8769: "ExifIFDPointer", 0x8825: "GPSInfoIFDPointer",
  0x829A: "ExposureTime", 0x829D: "FNumber", 0x8827: "ISOSpeedRatings",
  0x9000: "ExifVersion", 0x9003: "DateTimeOriginal", 0x9004: "DateTimeDigitized",
  0x920A: "FocalLength", 0xA405: "FocalLengthIn35mmFilm",
  0xA001: "ColorSpace", 0xA002: "PixelXDimension", 0xA003: "PixelYDimension",
  0xA430: "CameraOwnerName", 0xA431: "BodySerialNumber", 0xA432: "LensInfo",
  0xA433: "LensMake", 0xA434: "LensModel",
  0x0100: "ImageWidth", 0x0101: "ImageLength",
};

function readExif(buffer: ArrayBuffer): ExifTag[] {
  const view = new DataView(buffer);
  const tags: ExifTag[] = [];

  // Check JPEG SOI marker
  if (view.getUint16(0) !== 0xFFD8) return tags;

  let offset = 2;
  while (offset < view.byteLength - 2) {
    const marker = view.getUint16(offset);
    if (marker === 0xFFE1) { // APP1 - EXIF
      const length = view.getUint16(offset + 2);
      // Check "Exif\0\0"
      if (view.getUint32(offset + 4) === 0x45786966 && view.getUint16(offset + 8) === 0x0000) {
        const tiffOffset = offset + 10;
        const byteOrder = view.getUint16(tiffOffset);
        const le = byteOrder === 0x4949; // Little endian

        const getU16 = (o: number) => view.getUint16(o, le);
        const getU32 = (o: number) => view.getUint32(o, le);

        const ifdOffset = getU32(tiffOffset + 4);

        function readIFD(ifdStart: number) {
          if (ifdStart + tiffOffset + 2 > view.byteLength) return;
          const count = getU16(tiffOffset + ifdStart);
          for (let i = 0; i < count; i++) {
            const entryOffset = tiffOffset + ifdStart + 2 + i * 12;
            if (entryOffset + 12 > view.byteLength) break;
            const tag = getU16(entryOffset);
            const type = getU16(entryOffset + 2);
            const numValues = getU32(entryOffset + 4);
            const valueOffset = entryOffset + 8;

            const tagName = EXIF_TAGS[tag] || `Tag_0x${tag.toString(16).toUpperCase()}`;

            // Follow ExifIFD pointer
            if (tag === 0x8769) {
              const exifIfdOff = getU32(valueOffset);
              readIFD(exifIfdOff);
              continue;
            }

            let value = "";
            try {
              if (type === 2) { // ASCII
                const strOffset = numValues > 4 ? tiffOffset + getU32(valueOffset) : valueOffset;
                const bytes = new Uint8Array(buffer, strOffset, Math.min(numValues - 1, 200));
                value = new TextDecoder().decode(bytes);
              } else if (type === 3) { // SHORT
                value = String(getU16(valueOffset));
              } else if (type === 4) { // LONG
                value = String(getU32(valueOffset));
              } else if (type === 5) { // RATIONAL
                const ratOffset = tiffOffset + getU32(valueOffset);
                if (ratOffset + 8 <= view.byteLength) {
                  const num = getU32(ratOffset);
                  const den = getU32(ratOffset + 4);
                  value = den === 1 ? String(num) : `${num}/${den}`;
                  if (tag === 0x829A && den > 0) value = den > num ? `1/${Math.round(den / num)}s` : `${(num / den).toFixed(1)}s`;
                  if (tag === 0x829D && den > 0) value = `f/${(num / den).toFixed(1)}`;
                  if (tag === 0x920A && den > 0) value = `${(num / den).toFixed(1)}mm`;
                }
              } else if (type === 7) { // UNDEFINED
                if (numValues <= 4) {
                  const bytes: string[] = [];
                  for (let b = 0; b < numValues; b++) bytes.push(String(view.getUint8(valueOffset + b)));
                  value = bytes.join(".");
                }
              }
            } catch { value = "(unreadable)"; }

            if (value && tagName !== "ExifIFDPointer" && tagName !== "GPSInfoIFDPointer") {
              tags.push({ name: tagName, value });
            }
          }
        }

        readIFD(ifdOffset);
      }
      offset += 2 + length;
    } else if ((marker & 0xFF00) === 0xFF00) {
      if (marker === 0xFFDA) break; // SOS - no more metadata
      offset += 2 + view.getUint16(offset + 2);
    } else {
      break;
    }
  }

  return tags;
}

export default function ExifViewer() {
  const t = useTranslations("tools.exif-viewer");
  const [tags, setTags] = useState<ExifTag[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError(t("ui.notImage"));
      return;
    }
    setFileName(file.name);
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      const buf = reader.result as ArrayBuffer;
      const exif = readExif(buf);
      if (exif.length === 0) setError(t("ui.noExif"));
      setTags(exif);
    };
    reader.readAsArrayBuffer(file);
  }, [t]);

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={e => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = () => { if (inp.files?.[0]) handleFile(inp.files[0]); }; inp.click(); }}
      >
        <p className="text-sm text-zinc-500">{t("ui.dropImage")}</p>
      </div>
      {fileName && <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("ui.file")}: {fileName}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {tags.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-200 dark:border-zinc-700"><th className="text-left py-2 px-3 font-medium">{t("ui.tag")}</th><th className="text-left py-2 px-3 font-medium">{t("ui.value")}</th></tr></thead>
            <tbody>
              {tags.map((tag, i) => (
                <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 px-3 font-mono text-zinc-700 dark:text-zinc-300">{tag.name}</td>
                  <td className="py-2 px-3 font-mono text-blue-600 dark:text-blue-400">{tag.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

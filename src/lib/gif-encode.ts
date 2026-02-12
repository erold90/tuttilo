/**
 * Minimal GIF89a encoder for creating animated GIFs from canvas frames.
 * No external dependencies.
 */

/** Build a 256-color palette from frame pixel data using frequency analysis */
function buildPalette(imageData: Uint8ClampedArray): Uint8Array {
  const palette = new Uint8Array(768); // 256 * 3

  // Build histogram with 5-bit quantized colors for speed
  const hist = new Map<number, { r: number; g: number; b: number; count: number }>();
  const step = Math.max(1, Math.floor(imageData.length / 4 / 50000)) * 4; // sample ~50K pixels
  for (let i = 0; i < imageData.length; i += step) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const entry = hist.get(key);
    if (entry) {
      entry.r += r;
      entry.g += g;
      entry.b += b;
      entry.count++;
    } else {
      hist.set(key, { r, g, b, count: 1 });
    }
  }

  const sorted = [...hist.values()].sort((a, b) => b.count - a.count);
  const numColors = Math.min(256, sorted.length);

  for (let i = 0; i < numColors; i++) {
    const entry = sorted[i];
    palette[i * 3] = Math.round(entry.r / entry.count);
    palette[i * 3 + 1] = Math.round(entry.g / entry.count);
    palette[i * 3 + 2] = Math.round(entry.b / entry.count);
  }

  return palette;
}

/** Map each pixel to nearest palette color index with caching */
function indexFrame(
  imageData: Uint8ClampedArray,
  palette: Uint8Array,
  numPixels: number
): Uint8Array {
  const indices = new Uint8Array(numPixels);
  const cache = new Map<number, number>();

  for (let i = 0; i < numPixels; i++) {
    const r = imageData[i * 4];
    const g = imageData[i * 4 + 1];
    const b = imageData[i * 4 + 2];
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);

    const cached = cache.get(key);
    if (cached !== undefined) {
      indices[i] = cached;
      continue;
    }

    let minDist = Infinity;
    let minIdx = 0;
    for (let j = 0; j < 256; j++) {
      const dr = r - palette[j * 3];
      const dg = g - palette[j * 3 + 1];
      const db = b - palette[j * 3 + 2];
      const dist = dr * dr + dg * dg + db * db;
      if (dist < minDist) {
        minDist = dist;
        minIdx = j;
        if (dist === 0) break;
      }
    }

    cache.set(key, minIdx);
    indices[i] = minIdx;
  }

  return indices;
}

/** LZW encode pixel indices for GIF using tree-based code table */
function lzwEncode(indices: Uint8Array, minCodeSize: number): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;

  const output: number[] = [];
  let bits = 0;
  let buf = 0;
  let codeSize = minCodeSize + 1;

  function writeBits(code: number, size: number) {
    buf |= code << bits;
    bits += size;
    while (bits >= 8) {
      output.push(buf & 0xff);
      buf >>= 8;
      bits -= 8;
    }
  }

  type TreeNode = { code: number; children: Map<number, TreeNode> };

  let nextCode = 0;
  let root = new Map<number, TreeNode>();

  function resetTable() {
    root = new Map<number, TreeNode>();
    for (let i = 0; i < clearCode; i++) {
      root.set(i, { code: i, children: new Map() });
    }
    nextCode = eoiCode + 1;
    codeSize = minCodeSize + 1;
  }

  writeBits(clearCode, codeSize);
  resetTable();

  if (indices.length === 0) {
    writeBits(eoiCode, codeSize);
    if (bits > 0) output.push(buf & 0xff);
    return new Uint8Array(output);
  }

  let currentNode = root.get(indices[0])!;

  for (let i = 1; i < indices.length; i++) {
    const byte = indices[i];
    const child = currentNode.children.get(byte);

    if (child) {
      currentNode = child;
    } else {
      writeBits(currentNode.code, codeSize);

      if (nextCode < 4096) {
        currentNode.children.set(byte, {
          code: nextCode,
          children: new Map(),
        });
        if (nextCode >= 1 << codeSize && codeSize < 12) {
          codeSize++;
        }
        nextCode++;
      } else {
        writeBits(clearCode, codeSize);
        resetTable();
      }

      currentNode = root.get(byte)!;
    }
  }

  writeBits(currentNode.code, codeSize);
  writeBits(eoiCode, codeSize);

  if (bits > 0) {
    output.push(buf & 0xff);
  }

  return new Uint8Array(output);
}

/** Encode multiple ImageData frames into an animated GIF */
export function encodeGIF(
  frames: ImageData[],
  width: number,
  height: number,
  delayMs: number,
  onProgress?: (pct: number) => void
): Blob {
  const delay = Math.max(2, Math.round(delayMs / 10));
  const palette = buildPalette(frames[0].data);
  const numPixels = width * height;

  const out: number[] = [];

  function writeU8(v: number) { out.push(v & 0xff); }
  function writeU16LE(v: number) { out.push(v & 0xff); out.push((v >> 8) & 0xff); }
  function writeStr(s: string) { for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i)); }

  // Header
  writeStr("GIF89a");

  // Logical Screen Descriptor
  writeU16LE(width);
  writeU16LE(height);
  writeU8(0xf7); // GCT present, 8-bit color, 256 entries
  writeU8(0);
  writeU8(0);

  // Global Color Table
  for (let i = 0; i < palette.length; i++) out.push(palette[i]);

  // Netscape Application Extension (infinite loop)
  writeU8(0x21); writeU8(0xff); writeU8(11);
  writeStr("NETSCAPE2.0");
  writeU8(3); writeU8(1); writeU16LE(0); writeU8(0);

  // Frames
  for (let f = 0; f < frames.length; f++) {
    // Graphic Control Extension
    writeU8(0x21); writeU8(0xf9); writeU8(4);
    writeU8(0x00);
    writeU16LE(delay);
    writeU8(0);
    writeU8(0);

    // Image Descriptor
    writeU8(0x2c);
    writeU16LE(0); writeU16LE(0);
    writeU16LE(width); writeU16LE(height);
    writeU8(0);

    // Image Data
    const indices = indexFrame(frames[f].data, palette, numPixels);
    const compressed = lzwEncode(indices, 8);

    writeU8(8); // min code size
    for (let i = 0; i < compressed.length; i += 255) {
      const end = Math.min(i + 255, compressed.length);
      writeU8(end - i);
      for (let j = i; j < end; j++) out.push(compressed[j]);
    }
    writeU8(0); // block terminator

    if (onProgress) {
      onProgress(Math.round(((f + 1) / frames.length) * 100));
    }
  }

  // Trailer
  writeU8(0x3b);

  return new Blob([new Uint8Array(out)], { type: "image/gif" });
}

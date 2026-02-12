declare module "gifenc" {
  type RGBColor = [number, number, number];
  type RGBAColor = [number, number, number, number];
  type Palette = RGBColor[] | RGBAColor[];
  type Format = "rgb565" | "rgb444" | "rgba4444";

  interface WriteFrameOptions {
    palette?: Palette;
    delay?: number;
    transparent?: boolean;
    transparentIndex?: number;
    repeat?: number;
    colorDepth?: number;
    dispose?: number;
    first?: boolean;
  }

  interface GIFEncoderInstance {
    writeHeader(): void;
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options?: WriteFrameOptions
    ): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    buffer: ArrayBuffer;
    reset(): void;
  }

  interface GIFEncoderOptions {
    initialCapacity?: number;
    auto?: boolean;
  }

  export function GIFEncoder(options?: GIFEncoderOptions): GIFEncoderInstance;

  export function quantize(
    data: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: {
      format?: Format;
      clearAlpha?: boolean;
      clearAlphaColor?: number;
      clearAlphaThreshold?: number;
      oneBitAlpha?: boolean | number;
    }
  ): Palette;

  export function applyPalette(
    data: Uint8Array | Uint8ClampedArray,
    palette: Palette,
    format?: Format
  ): Uint8Array;

  export function prequantize(
    data: Uint8Array | Uint8ClampedArray,
    options?: {
      roundRGB?: number;
      roundAlpha?: number;
      oneBitAlpha?: number | null;
    }
  ): void;

  export function snapColorsToPalette(
    palette: Palette,
    knownColors: Palette,
    threshold?: number
  ): void;

  export function nearestColorIndex(
    palette: Palette,
    color: RGBColor | RGBAColor
  ): number;

  export default GIFEncoder;
}

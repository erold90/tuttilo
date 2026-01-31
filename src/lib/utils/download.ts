import { createDownloadUrl } from "@/lib/utils/file";

/**
 * Download a single Blob as a file.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  createDownloadUrl(blob, filename);
}

/**
 * Download multiple files sequentially with a small delay between each
 * to prevent browser blocking multiple downloads.
 */
export function downloadMultiple(
  blobs: Blob[],
  filenames: string[]
): void {
  if (blobs.length === 0) return;

  if (blobs.length === 1 && filenames[0]) {
    downloadBlob(blobs[0], filenames[0]);
    return;
  }

  blobs.forEach((blob, index) => {
    const filename = filenames[index];
    if (!filename) return;

    // Stagger downloads by 200ms to avoid browser blocking
    setTimeout(() => {
      downloadBlob(blob, filename);
    }, index * 200);
  });
}

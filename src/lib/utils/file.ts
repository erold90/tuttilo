const FILE_SIZE_UNITS = ["B", "KB", "MB", "GB", "TB"];

/**
 * Format bytes into a human-readable file size string.
 * @example formatFileSize(1536) => "1.5 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unit = FILE_SIZE_UNITS[i] || "B";
  const value = bytes / Math.pow(k, i);

  return `${value % 1 === 0 ? value : value.toFixed(1)} ${unit}`;
}

/**
 * Get the file extension from a filename, including the dot.
 * @example getFileExtension("report.pdf") => ".pdf"
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1 || lastDot === filename.length - 1) return "";
  return filename.slice(lastDot).toLowerCase();
}

/**
 * Map common file extensions to MIME types.
 */
const MIME_MAP: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".csv": "text/csv",
  ".json": "application/json",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".bmp": "image/bmp",
  ".tiff": "image/tiff",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".zip": "application/zip",
  ".rar": "application/x-rar-compressed",
  ".7z": "application/x-7z-compressed",
  ".tar": "application/x-tar",
  ".gz": "application/gzip",
};

/**
 * Get MIME type for a file extension.
 * @example getMimeType(".pdf") => "application/pdf"
 */
export function getMimeType(extension: string): string {
  const ext = extension.startsWith(".") ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
  return MIME_MAP[ext] || "application/octet-stream";
}

/**
 * Check if a file matches the accepted MIME types.
 * Supports both exact types ("image/png") and wildcards ("image/*").
 */
export function isValidFileType(file: File, acceptedTypes: string[]): boolean {
  if (acceptedTypes.length === 0) return true;

  return acceptedTypes.some((accepted) => {
    if (accepted === "*/*") return true;

    // Extension-based check (e.g., ".pdf")
    if (accepted.startsWith(".")) {
      return getFileExtension(file.name) === accepted.toLowerCase();
    }

    // Wildcard MIME type (e.g., "image/*")
    if (accepted.endsWith("/*")) {
      const prefix = accepted.slice(0, -2);
      return file.type.startsWith(prefix);
    }

    // Exact MIME type match
    return file.type === accepted;
  });
}

/**
 * Check if a file is within the maximum allowed size.
 */
export function isValidFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * Create a temporary download URL for a Blob and trigger download.
 */
export function createDownloadUrl(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();

  // Cleanup after a short delay to ensure download starts
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Revoke a previously created Object URL.
 */
export function revokeDownloadUrl(url: string): void {
  URL.revokeObjectURL(url);
}

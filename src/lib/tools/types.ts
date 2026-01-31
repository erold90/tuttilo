// ============================================================================
// Tuttilo - Shared Types for the Tool System
// ============================================================================

import type { ToolCategoryId, ProcessingType } from './registry'

/**
 * Result returned by a tool after processing a file or input
 */
export interface ProcessingResult {
  /** Whether the processing completed successfully */
  success: boolean
  /** Output files (downloads) */
  files: OutputFile[]
  /** Human-readable message (e.g. "Compressed from 5 MB to 1.2 MB") */
  message?: string
  /** Processing time in milliseconds */
  duration?: number
  /** Optional metadata (tool-specific) */
  metadata?: Record<string, unknown>
  /** Error message if success is false */
  error?: string
}

/**
 * A single output file produced by a tool
 */
export interface OutputFile {
  /** File name for download */
  name: string
  /** MIME type of the output file */
  mimeType: string
  /** File content as Blob */
  blob: Blob
  /** File size in bytes */
  size: number
}

/**
 * Information about an uploaded file
 */
export interface FileInfo {
  /** Original file name */
  name: string
  /** MIME type */
  mimeType: string
  /** File size in bytes */
  size: number
  /** File object reference */
  file: File
  /** Preview URL (for images/videos) */
  previewUrl?: string
  /** Unique identifier for this upload instance */
  id: string
}

/**
 * Options passed to a tool's processing function
 */
export interface ToolOptions {
  /** Quality setting (0-100), used by compressors and converters */
  quality?: number
  /** Output format (e.g. 'jpg', 'png', 'mp3') */
  outputFormat?: string
  /** Width in pixels (for image/video resize) */
  width?: number
  /** Height in pixels (for image/video resize) */
  height?: number
  /** Maintain aspect ratio */
  keepAspectRatio?: boolean
  /** Page range (for PDF tools, e.g. "1-3,5,7-9") */
  pages?: string
  /** Rotation angle in degrees (for rotate tools) */
  rotation?: number
  /** Start time in seconds (for trim/cut tools) */
  startTime?: number
  /** End time in seconds (for trim/cut tools) */
  endTime?: number
  /** Additional tool-specific options */
  [key: string]: unknown
}

/**
 * State of the upload / processing pipeline in the UI
 */
export type UploadState =
  | 'idle'          // Waiting for user to upload
  | 'uploading'     // Files being read into memory
  | 'ready'         // Files loaded, ready to process
  | 'processing'    // Tool is working
  | 'done'          // Processing completed successfully
  | 'error'         // Something went wrong

/**
 * Full state object for the upload component
 */
export interface UploadComponentState {
  /** Current phase */
  state: UploadState
  /** Uploaded files */
  files: FileInfo[]
  /** Processing progress (0-100) */
  progress: number
  /** Result after processing */
  result?: ProcessingResult
  /** Error message if state is 'error' */
  errorMessage?: string
}

/**
 * Interface that each tool processor must implement
 */
export interface ToolProcessor {
  /** Process the input files with the given options */
  process(files: FileInfo[], options: ToolOptions): Promise<ProcessingResult>
  /** Validate input files before processing */
  validate?(files: FileInfo[]): { valid: boolean; error?: string }
}

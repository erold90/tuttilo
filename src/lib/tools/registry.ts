// ============================================================================
// Tuttilo - Tool Registry
// All tool definitions, categories, and helper functions
// ============================================================================

export type ToolCategoryId = 'pdf' | 'image' | 'video' | 'audio' | 'text' | 'developer' | 'youtube' | 'calculators' | 'converters' | 'color-design' | 'security' | 'datetime' | 'seo' | 'social' | 'generators' | 'network'

export type ProcessingType = 'client' | 'server' | 'none'

export interface Tool {
  id: string
  slug: string
  category: ToolCategoryId
  icon: string
  isAvailable: boolean
  isPremium: boolean
  maxFileSize: number
  acceptedFormats: string[]
  processingType: ProcessingType
}

export interface ToolCategory {
  id: ToolCategoryId
  slug: string
  color: string
  icon: string
}

// ============================================================================
// Categories
// ============================================================================

export const categories: ToolCategory[] = [
  // --- File Tools ---
  { id: 'pdf',          slug: 'pdf',          color: '#EF4444', icon: 'FileText' },
  { id: 'image',        slug: 'image',        color: '#22C55E', icon: 'Image' },
  { id: 'video',        slug: 'video',        color: '#8B5CF6', icon: 'Video' },
  { id: 'audio',        slug: 'audio',        color: '#F97316', icon: 'Music' },
  // --- Content ---
  { id: 'text',         slug: 'text',         color: '#3B82F6', icon: 'Type' },
  { id: 'youtube',      slug: 'youtube',      color: '#EC4899', icon: 'Youtube' },
  // --- Utility ---
  { id: 'calculators',  slug: 'calculators',  color: '#F59E0B', icon: 'Calculator' },
  { id: 'converters',   slug: 'converters',   color: '#06B6D4', icon: 'ArrowsClockwise' },
  { id: 'color-design', slug: 'color-design', color: '#A855F7', icon: 'Palette' },
  { id: 'datetime',     slug: 'datetime',     color: '#0EA5E9', icon: 'Clock' },
  { id: 'generators',   slug: 'generators',   color: '#7C3AED', icon: 'Shuffle' },
  // --- Web & Dev ---
  { id: 'developer',    slug: 'developer',    color: '#14B8A6', icon: 'Code' },
  { id: 'seo',          slug: 'seo',          color: '#84CC16', icon: 'MagnifyingGlass' },
  { id: 'social',       slug: 'social',       color: '#E11D48', icon: 'ShareNetwork' },
  { id: 'network',      slug: 'network',      color: '#475569', icon: 'Globe' },
  { id: 'security',     slug: 'security',     color: '#DC2626', icon: 'ShieldCheck' },
]

// ============================================================================
// Category Macro-Groups (for mega menu & mobile nav)
// ============================================================================

export type CategoryGroupId = 'file' | 'content' | 'utility' | 'webdev'

export interface CategoryGroup {
  id: CategoryGroupId
  categories: ToolCategoryId[]
}

export const categoryGroups: CategoryGroup[] = [
  { id: 'file',    categories: ['pdf', 'image', 'video', 'audio'] },
  { id: 'content', categories: ['text', 'youtube'] },
  { id: 'utility', categories: ['calculators', 'converters', 'color-design', 'datetime', 'generators'] },
  { id: 'webdev',  categories: ['developer', 'seo', 'social', 'network', 'security'] },
]

/** Categories shown directly in the top navbar (desktop) */
export const primaryNavCategories: ToolCategoryId[] = ['pdf', 'image', 'video', 'converters', 'calculators']

// ============================================================================
// Tools
// ============================================================================

export const tools: Tool[] = [
  // ---------- PDF (19 tools — ordered by popularity) ----------
  { id: 'compress-pdf', slug: 'compress', category: 'pdf', icon: 'Minimize2', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'pdf-organizer', slug: 'organizer', category: 'pdf', icon: 'LayoutDashboard', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'pdf-word', slug: 'word', category: 'pdf', icon: 'FileText', isAvailable: true, isPremium: false, maxFileSize: 50 * 1024 * 1024, acceptedFormats: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'], processingType: 'client' },
  { id: 'pdf-editor', slug: 'editor', category: 'pdf', icon: 'PenTool', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'pdf-fill-sign', slug: 'fill-sign', category: 'pdf', icon: 'PenLine', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'pdf-images', slug: 'images', category: 'pdf', icon: 'FileImage', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'], processingType: 'client' },
  { id: 'pdf-excel', slug: 'excel', category: 'pdf', icon: 'Table', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'], processingType: 'client' },
  { id: 'pdf-pptx', slug: 'powerpoint', category: 'pdf', icon: 'Presentation', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'], processingType: 'client' },
  { id: 'html-to-pdf', slug: 'from-html', category: 'pdf', icon: 'Code', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'client' },
  { id: 'unlock-pdf', slug: 'unlock', category: 'pdf', icon: 'Unlock', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'pdf-protect', slug: 'protect', category: 'pdf', icon: 'ShieldCheck', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'pdf-flatten', slug: 'flatten', category: 'pdf', icon: 'Rows', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'pdf-crop', slug: 'crop', category: 'pdf', icon: 'Crop', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'pdf-compare', slug: 'compare', category: 'pdf', icon: 'GitCompare', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'pdf-page-numbers', slug: 'page-numbers', category: 'pdf', icon: 'ListNumbers', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'pdf-watermark', slug: 'watermark', category: 'pdf', icon: 'Drop', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'pdf-ocr', slug: 'ocr', category: 'pdf', icon: 'Scan', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff'], processingType: 'client' },
  { id: 'pdf-repair', slug: 'repair', category: 'pdf', icon: 'Wrench', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'pdf-to-pdfa', slug: 'to-pdfa', category: 'pdf', icon: 'Certificate', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'pdf-to-text', slug: 'to-text', category: 'pdf', icon: 'FileText', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'pdf-metadata', slug: 'metadata', category: 'pdf', icon: 'Info', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'grayscale-pdf', slug: 'grayscale', category: 'pdf', icon: 'CircleHalf', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'redact-pdf', slug: 'redact', category: 'pdf', icon: 'EyeOff', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },
  { id: 'extract-pdf-images', slug: 'extract-images', category: 'pdf', icon: 'Images', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['application/pdf'], processingType: 'client' },

  // ---------- Image (3 tools: converter + editor + remove-bg) ----------
  { id: 'image-converter', slug: 'converter', category: 'image', icon: 'ArrowRightLeft', isAvailable: true, isPremium: false, maxFileSize: 50 * 1024 * 1024, acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml', 'image/heic', 'image/heif', 'image/avif', 'image/tiff'], processingType: 'client' },
  { id: 'image-editor', slug: 'editor', category: 'image', icon: 'Sliders', isAvailable: true, isPremium: false, maxFileSize: 50 * 1024 * 1024, acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml', 'image/heic', 'image/heif', 'image/avif'], processingType: 'client' },
  { id: 'remove-bg', slug: 'remove-bg', category: 'image', icon: 'Eraser', isAvailable: false, isPremium: false, maxFileSize: 25 * 1024 * 1024, acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'], processingType: 'client' },
  { id: 'image-compressor', slug: 'compressor', category: 'image', icon: 'Minimize2', isAvailable: true, isPremium: false, maxFileSize: 50 * 1024 * 1024, acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'], processingType: 'client' },
  { id: 'image-resizer', slug: 'resizer', category: 'image', icon: 'Maximize2', isAvailable: true, isPremium: false, maxFileSize: 50 * 1024 * 1024, acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'], processingType: 'client' },
  { id: 'image-cropper', slug: 'cropper', category: 'image', icon: 'Crop', isAvailable: true, isPremium: false, maxFileSize: 50 * 1024 * 1024, acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'], processingType: 'client' },
  { id: 'image-to-text', slug: 'to-text', category: 'image', icon: 'Scan', isAvailable: true, isPremium: false, maxFileSize: 25 * 1024 * 1024, acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff'], processingType: 'client' },
  { id: 'meme-maker', slug: 'meme-maker', category: 'image', icon: 'Laugh', isAvailable: true, isPremium: false, maxFileSize: 50 * 1024 * 1024, acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'], processingType: 'client' },
  { id: 'add-text-to-image', slug: 'add-text', category: 'image', icon: 'Type', isAvailable: true, isPremium: false, maxFileSize: 50 * 1024 * 1024, acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'], processingType: 'client' },

  // ---------- Video (10 tools) ----------
  { id: 'compress-video', slug: 'compress', category: 'video', icon: 'Minimize2', isAvailable: true, isPremium: false, maxFileSize: 500 * 1024 * 1024, acceptedFormats: ['video/mp4', 'video/webm', 'video/quicktime'], processingType: 'client' },
  { id: 'trim-video', slug: 'trim', category: 'video', icon: 'Scissors', isAvailable: true, isPremium: false, maxFileSize: 500 * 1024 * 1024, acceptedFormats: ['video/mp4', 'video/webm', 'video/quicktime'], processingType: 'client' },
  { id: 'video-to-gif', slug: 'to-gif', category: 'video', icon: 'Film', isAvailable: true, isPremium: false, maxFileSize: 200 * 1024 * 1024, acceptedFormats: ['video/mp4', 'video/webm'], processingType: 'client' },
  { id: 'video-to-mp3', slug: 'to-mp3', category: 'video', icon: 'Music', isAvailable: true, isPremium: false, maxFileSize: 500 * 1024 * 1024, acceptedFormats: ['video/mp4', 'video/webm', 'video/quicktime'], processingType: 'client' },
  { id: 'video-converter', slug: 'converter', category: 'video', icon: 'ArrowRightLeft', isAvailable: true, isPremium: false, maxFileSize: 500 * 1024 * 1024, acceptedFormats: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'], processingType: 'client' },
  { id: 'rotate-video', slug: 'rotate', category: 'video', icon: 'RotateCw', isAvailable: true, isPremium: false, maxFileSize: 500 * 1024 * 1024, acceptedFormats: ['video/mp4', 'video/webm', 'video/quicktime'], processingType: 'client' },
  { id: 'mute-video', slug: 'mute', category: 'video', icon: 'VolumeX', isAvailable: true, isPremium: false, maxFileSize: 500 * 1024 * 1024, acceptedFormats: ['video/mp4', 'video/webm', 'video/quicktime'], processingType: 'client' },
  { id: 'change-video-speed', slug: 'speed', category: 'video', icon: 'FastForward', isAvailable: true, isPremium: false, maxFileSize: 500 * 1024 * 1024, acceptedFormats: ['video/mp4', 'video/webm', 'video/quicktime'], processingType: 'client' },
  { id: 'resize-video', slug: 'resize', category: 'video', icon: 'Maximize2', isAvailable: true, isPremium: false, maxFileSize: 500 * 1024 * 1024, acceptedFormats: ['video/mp4', 'video/webm', 'video/quicktime'], processingType: 'client' },
  { id: 'screen-recorder', slug: 'screen-recorder', category: 'video', icon: 'Monitor', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },

  // ---------- Audio (3 tools) ----------
  { id: 'audio-cutter', slug: 'cutter', category: 'audio', icon: 'Scissors', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac'], processingType: 'client' },
  { id: 'audio-converter', slug: 'converter', category: 'audio', icon: 'ArrowRightLeft', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac'], processingType: 'client' },
  { id: 'voice-recorder', slug: 'voice-recorder', category: 'audio', icon: 'Mic', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'audio-joiner', slug: 'joiner', category: 'audio', icon: 'GitMerge2', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'], processingType: 'client' },
  { id: 'change-audio-speed', slug: 'speed', category: 'audio', icon: 'FastForward', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'], processingType: 'client' },
  { id: 'text-to-speech', slug: 'text-to-speech', category: 'audio', icon: 'Speaker', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'reverse-audio', slug: 'reverse', category: 'audio', icon: 'Rewind', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'], processingType: 'client' },
  { id: 'change-audio-volume', slug: 'volume', category: 'audio', icon: 'Volume2', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'], processingType: 'client' },

  // ---------- Text (5 tools) ----------
  { id: 'word-counter', slug: 'word-counter', category: 'text', icon: 'Hash', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'lorem-ipsum', slug: 'lorem-ipsum', category: 'text', icon: 'AlignLeft', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'case-converter', slug: 'case-converter', category: 'text', icon: 'CaseSensitive', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'diff-checker', slug: 'diff-checker', category: 'text', icon: 'GitCompare', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'markdown-editor', slug: 'markdown-editor', category: 'text', icon: 'FileCode', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'csv-json', slug: 'csv-json', category: 'text', icon: 'Table', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'text-formatter', slug: 'text-formatter', category: 'text', icon: 'AlignLeft', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'notepad', slug: 'notepad', category: 'text', icon: 'FileText', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'markdown-to-html', slug: 'markdown-to-html', category: 'text', icon: 'Code', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'find-replace', slug: 'find-replace', category: 'text', icon: 'Search', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },

  // ---------- Developer (8 tools) ----------
  { id: 'json-formatter', slug: 'json-formatter', category: 'developer', icon: 'Braces', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'base64', slug: 'base64', category: 'developer', icon: 'Binary', isAvailable: true, isPremium: false, maxFileSize: 10 * 1024 * 1024, acceptedFormats: [], processingType: 'none' },
  { id: 'regex-tester', slug: 'regex-tester', category: 'developer', icon: 'Regex', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'color-picker', slug: 'color-picker', category: 'color-design', icon: 'Palette', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'qr-code', slug: 'qr-code', category: 'developer', icon: 'QrCode', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'hex-rgb', slug: 'hex-rgb', category: 'color-design', icon: 'Pipette', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'url-encoder', slug: 'url-encoder', category: 'developer', icon: 'Link', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'timestamp', slug: 'timestamp', category: 'developer', icon: 'Clock', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'password-generator', slug: 'password-generator', category: 'developer', icon: 'Key', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'hash-generator', slug: 'hash-generator', category: 'developer', icon: 'Fingerprint', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'uuid-generator', slug: 'uuid-generator', category: 'developer', icon: 'Shuffle', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'jwt-decoder', slug: 'jwt-decoder', category: 'developer', icon: 'ShieldCheck', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'css-minifier', slug: 'css-minifier', category: 'developer', icon: 'FileCode', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'sql-formatter', slug: 'sql-formatter', category: 'developer', icon: 'Database', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },

  // ---------- Calculators (6 tools) ----------
  { id: 'scientific-calculator', slug: 'scientific', category: 'calculators', icon: 'Calculator', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'percentage-calculator', slug: 'percentage', category: 'calculators', icon: 'Percent', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'bmi-calculator', slug: 'bmi', category: 'calculators', icon: 'Heartbeat', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'loan-calculator', slug: 'loan', category: 'calculators', icon: 'Bank', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'mortgage-calculator', slug: 'mortgage', category: 'calculators', icon: 'House', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'compound-interest-calculator', slug: 'compound-interest', category: 'calculators', icon: 'TrendUp', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'roi-calculator', slug: 'roi', category: 'calculators', icon: 'ChartLine', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'tip-calculator', slug: 'tip', category: 'calculators', icon: 'CurrencyDollar', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'salary-calculator', slug: 'salary', category: 'calculators', icon: 'Wallet', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'vat-calculator', slug: 'vat', category: 'calculators', icon: 'Receipt', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'profit-margin-calculator', slug: 'profit-margin', category: 'calculators', icon: 'ChartBar', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'discount-calculator', slug: 'discount', category: 'calculators', icon: 'TagSimple', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'age-calculator', slug: 'age', category: 'calculators', icon: 'CalendarBlank', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'date-diff-calculator', slug: 'date-diff', category: 'calculators', icon: 'CalendarDots', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'calorie-calculator', slug: 'calorie', category: 'calculators', icon: 'ForkKnife', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'fraction-calculator', slug: 'fraction', category: 'calculators', icon: 'MathOperations', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'grade-calculator', slug: 'grade', category: 'calculators', icon: 'GraduationCap', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'break-even-calculator', slug: 'break-even', category: 'calculators', icon: 'Scales', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },

  // ---------- Converters ----------
  { id: 'length-converter', slug: 'length', category: 'converters', icon: 'Ruler', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'weight-converter', slug: 'weight', category: 'converters', icon: 'Barbell', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'temperature-converter', slug: 'temperature', category: 'converters', icon: 'Thermometer', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'data-size-converter', slug: 'data-size', category: 'converters', icon: 'HardDrive', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'area-converter', slug: 'area', category: 'converters', icon: 'BoundingBox', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'volume-converter', slug: 'volume', category: 'converters', icon: 'Drop', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'speed-converter', slug: 'speed', category: 'converters', icon: 'Gauge', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'time-converter', slug: 'time', category: 'converters', icon: 'Clock', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'fuel-economy-converter', slug: 'fuel-economy', category: 'converters', icon: 'GasPump', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'shoe-size-converter', slug: 'shoe-size', category: 'converters', icon: 'Sneaker', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'pressure-converter', slug: 'pressure', category: 'converters', icon: 'Gauge', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'energy-converter', slug: 'energy', category: 'converters', icon: 'Lightning', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'number-base-converter', slug: 'number-base', category: 'converters', icon: 'Binary', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'roman-numeral-converter', slug: 'roman-numeral', category: 'converters', icon: 'TextAa', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'power-converter', slug: 'power', category: 'converters', icon: 'Lightning', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },

  // ---------- Color & Design ----------
  { id: 'gradient-generator', slug: 'gradient-generator', category: 'color-design', icon: 'Gradient', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'palette-generator', slug: 'palette-generator', category: 'color-design', icon: 'SwatchBook', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'contrast-checker', slug: 'contrast-checker', category: 'color-design', icon: 'SunDim', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },

  // ---------- YouTube (9 tools) ----------
  { id: 'youtube-thumbnail', slug: 'thumbnail', category: 'youtube', icon: 'Image', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'client' },
  { id: 'youtube-transcript', slug: 'transcript', category: 'youtube', icon: 'Subtitles', isAvailable: false, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'server' },
  { id: 'youtube-money-calculator', slug: 'money-calculator', category: 'youtube', icon: 'Dollar', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'youtube-embed-generator', slug: 'embed-generator', category: 'youtube', icon: 'Browsers', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'youtube-seo-generator', slug: 'seo-generator', category: 'youtube', icon: 'TagSimple', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'youtube-channel-name-generator', slug: 'channel-name-generator', category: 'youtube', icon: 'At', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'youtube-watch-time-calculator', slug: 'watch-time-calculator', category: 'youtube', icon: 'Timer', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'youtube-video-analyzer', slug: 'video-analyzer', category: 'youtube', icon: 'ChartBar', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'client' },
  { id: 'youtube-channel-analyzer', slug: 'channel-analyzer', category: 'youtube', icon: 'ChartLine', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'client' },
]

// ============================================================================
// Helper Functions
// ============================================================================

export function getToolsByCategory(category: ToolCategoryId): Tool[] {
  return tools.filter((t) => t.category === category)
}

export function getToolBySlug(category: ToolCategoryId, slug: string): Tool | undefined {
  return tools.find((t) => t.category === category && t.slug === slug)
}

export function getAvailableTools(): Tool[] {
  return tools.filter((t) => t.isAvailable)
}

export function getAllCategories(): ToolCategory[] {
  return categories
}

export function getPopularTools(): Tool[] {
  const popularIds = [
    'pdf-organizer', 'compress-pdf', 'pdf-word', 'image-converter',
    'image-editor', 'video-to-mp3', 'compress-video', 'word-counter',
    'json-formatter', 'qr-code', 'password-generator', 'audio-converter',
  ]
  return popularIds.map((id) => tools.find((t) => t.id === id)).filter((t): t is Tool => t !== undefined)
}

/** Get mega menu groups with their categories and tool counts */
export function getMegaMenuGroups() {
  return categoryGroups.map((group) => ({
    id: group.id,
    categories: group.categories.map((catId) => {
      const cat = categories.find((c) => c.id === catId)!
      const catTools = getToolsByCategory(catId)
      return {
        id: catId,
        slug: cat.slug,
        icon: cat.icon,
        color: getCategoryColor(catId),
        classes: getCategoryClasses(catId),
        availableCount: catTools.filter((t) => t.isAvailable).length,
        totalCount: catTools.length,
      }
    }),
  }))
}

/** Get only primary nav categories (shown in top bar) */
export function getPrimaryNavItems() {
  return primaryNavCategories.map((catId) => {
    const cat = categories.find((c) => c.id === catId)!
    const classes = getCategoryClasses(catId)
    return {
      key: catId,
      href: `/${cat.slug}`,
      icon: cat.icon,
      color: getCategoryColor(catId),
      hoverText: classes.hoverText,
      classes,
      availableTools: getToolsByCategory(catId).filter((t) => t.isAvailable).length,
    }
  })
}

// ============================================================================
// Category Color Utilities — SINGLE SOURCE OF TRUTH
// Use these instead of hardcoding colors in components
// ============================================================================

const categoryColorMap: Record<ToolCategoryId, string> = {
  pdf: '#EF4444',
  image: '#22C55E',
  video: '#8B5CF6',
  audio: '#F97316',
  text: '#3B82F6',
  developer: '#14B8A6',
  youtube: '#EC4899',
  calculators: '#F59E0B',
  converters: '#06B6D4',
  'color-design': '#A855F7',
  security: '#DC2626',
  datetime: '#0EA5E9',
  seo: '#84CC16',
  social: '#E11D48',
  generators: '#7C3AED',
  network: '#475569',
}

export function getCategoryColor(id: ToolCategoryId): string {
  return categoryColorMap[id] ?? '#6366F1'
}

function buildCategoryClasses(hex: string) {
  return {
    text: `text-[${hex}]`,
    bg: `bg-[${hex}]/10`,
    border: `border-[${hex}]/20`,
    hoverBorder: `hover:border-[${hex}]/40`,
    hoverText: `hover:text-[${hex}]`,
    card: `bg-[${hex}]/10 text-[${hex}] border-[${hex}]/20`,
    cardHover: `hover:border-[${hex}]/40`,
  }
}

const categoryClassesMap: Record<ToolCategoryId, { text: string; bg: string; border: string; hoverBorder: string; hoverText: string; card: string; cardHover: string }> = {
  pdf:            buildCategoryClasses('#EF4444'),
  image:          buildCategoryClasses('#22C55E'),
  video:          buildCategoryClasses('#8B5CF6'),
  audio:          buildCategoryClasses('#F97316'),
  text:           buildCategoryClasses('#3B82F6'),
  developer:      buildCategoryClasses('#14B8A6'),
  youtube:        buildCategoryClasses('#EC4899'),
  calculators:    buildCategoryClasses('#F59E0B'),
  converters:     buildCategoryClasses('#06B6D4'),
  'color-design': buildCategoryClasses('#A855F7'),
  security:       buildCategoryClasses('#DC2626'),
  datetime:       buildCategoryClasses('#0EA5E9'),
  seo:            buildCategoryClasses('#84CC16'),
  social:         buildCategoryClasses('#E11D48'),
  generators:     buildCategoryClasses('#7C3AED'),
  network:        buildCategoryClasses('#475569'),
}

const defaultClasses = { text: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10', border: 'border-[#6366F1]/20', hoverBorder: 'hover:border-[#6366F1]/40', hoverText: 'hover:text-[#6366F1]', card: 'bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/20', cardHover: 'hover:border-[#6366F1]/40' }

export function getCategoryClasses(id: ToolCategoryId) {
  return categoryClassesMap[id] ?? defaultClasses
}

/** Navigation items derived from categories — for header, footer, mega-menu */
export function getCategoryNavItems() {
  return categories.map((cat) => {
    const classes = getCategoryClasses(cat.id)
    return {
      key: cat.id,
      href: `/${cat.slug}`,
      icon: cat.icon,
      color: getCategoryColor(cat.id),
      hoverText: classes.hoverText,
      classes,
      tools: getToolsByCategory(cat.id).filter((tool) => tool.isAvailable),
      totalTools: getToolsByCategory(cat.id).length,
      availableTools: getToolsByCategory(cat.id).filter((tool) => tool.isAvailable).length,
    }
  })
}

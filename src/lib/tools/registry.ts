// ============================================================================
// Tuttilo - Tool Registry
// All tool definitions, categories, and helper functions
// ============================================================================

export type ToolCategoryId = 'pdf' | 'image' | 'video' | 'audio' | 'text' | 'developer' | 'youtube'

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
  { id: 'pdf',       slug: 'pdf',       color: '#EF4444', icon: 'FileText' },
  { id: 'image',     slug: 'image',     color: '#22C55E', icon: 'Image' },
  { id: 'video',     slug: 'video',     color: '#8B5CF6', icon: 'Video' },
  { id: 'audio',     slug: 'audio',     color: '#F97316', icon: 'Music' },
  { id: 'text',      slug: 'text',      color: '#3B82F6', icon: 'Type' },
  { id: 'developer', slug: 'developer', color: '#14B8A6', icon: 'Code' },
  { id: 'youtube',   slug: 'youtube',   color: '#EC4899', icon: 'Youtube' },
]

// ============================================================================
// Tools
// ============================================================================

export const tools: Tool[] = [
  // ---------- PDF (12 tools) ----------
  {
    id: 'merge-pdf',
    slug: 'merge',
    category: 'pdf',
    icon: 'Merge',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 100 * 1024 * 1024, // 100 MB
    acceptedFormats: ['application/pdf'],
    processingType: 'client',
  },
  {
    id: 'split-pdf',
    slug: 'split',
    category: 'pdf',
    icon: 'Scissors',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 100 * 1024 * 1024,
    acceptedFormats: ['application/pdf'],
    processingType: 'client',
  },
  {
    id: 'compress-pdf',
    slug: 'compress',
    category: 'pdf',
    icon: 'Minimize2',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 100 * 1024 * 1024,
    acceptedFormats: ['application/pdf'],
    processingType: 'client',
  },
  {
    id: 'pdf-to-jpg',
    slug: 'to-jpg',
    category: 'pdf',
    icon: 'FileImage',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 100 * 1024 * 1024,
    acceptedFormats: ['application/pdf'],
    processingType: 'client',
  },
  {
    id: 'jpg-to-pdf',
    slug: 'from-jpg',
    category: 'pdf',
    icon: 'FileUp',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 50 * 1024 * 1024, // 50 MB
    acceptedFormats: ['image/jpeg'],
    processingType: 'client',
  },
  {
    id: 'rotate-pdf',
    slug: 'rotate',
    category: 'pdf',
    icon: 'RotateCw',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 100 * 1024 * 1024,
    acceptedFormats: ['application/pdf'],
    processingType: 'client',
  },
  {
    id: 'pdf-to-word',
    slug: 'to-word',
    category: 'pdf',
    icon: 'FileText',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 50 * 1024 * 1024,
    acceptedFormats: ['application/pdf'],
    processingType: 'server',
  },
  {
    id: 'word-to-pdf',
    slug: 'from-word',
    category: 'pdf',
    icon: 'FileUp',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 50 * 1024 * 1024,
    acceptedFormats: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],
    processingType: 'server',
  },
  {
    id: 'pdf-to-png',
    slug: 'to-png',
    category: 'pdf',
    icon: 'FileImage',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 100 * 1024 * 1024,
    acceptedFormats: ['application/pdf'],
    processingType: 'client',
  },
  {
    id: 'unlock-pdf',
    slug: 'unlock',
    category: 'pdf',
    icon: 'Unlock',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 100 * 1024 * 1024,
    acceptedFormats: ['application/pdf'],
    processingType: 'client',
  },
  {
    id: 'images-to-pdf',
    slug: 'from-images',
    category: 'pdf',
    icon: 'Images',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 50 * 1024 * 1024,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    processingType: 'client',
  },
  {
    id: 'pdf-editor',
    slug: 'editor',
    category: 'pdf',
    icon: 'PenTool',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 100 * 1024 * 1024,
    acceptedFormats: ['application/pdf'],
    processingType: 'client',
  },

  // ---------- Image (10 tools) ----------
  {
    id: 'compress-image',
    slug: 'compress',
    category: 'image',
    icon: 'Minimize2',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 50 * 1024 * 1024,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    processingType: 'client',
  },
  {
    id: 'resize-image',
    slug: 'resize',
    category: 'image',
    icon: 'Maximize2',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 50 * 1024 * 1024,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    processingType: 'client',
  },
  {
    id: 'crop-image',
    slug: 'crop',
    category: 'image',
    icon: 'Crop',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 50 * 1024 * 1024,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    processingType: 'client',
  },
  {
    id: 'png-to-jpg',
    slug: 'png-to-jpg',
    category: 'image',
    icon: 'ArrowRightLeft',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 50 * 1024 * 1024,
    acceptedFormats: ['image/png'],
    processingType: 'client',
  },
  {
    id: 'jpg-to-png',
    slug: 'jpg-to-png',
    category: 'image',
    icon: 'ArrowRightLeft',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 50 * 1024 * 1024,
    acceptedFormats: ['image/jpeg'],
    processingType: 'client',
  },
  {
    id: 'webp-to-png',
    slug: 'webp-to-png',
    category: 'image',
    icon: 'ArrowRightLeft',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 50 * 1024 * 1024,
    acceptedFormats: ['image/webp'],
    processingType: 'client',
  },
  {
    id: 'webp-to-jpg',
    slug: 'webp-to-jpg',
    category: 'image',
    icon: 'ArrowRightLeft',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 50 * 1024 * 1024,
    acceptedFormats: ['image/webp'],
    processingType: 'client',
  },
  {
    id: 'heic-to-jpg',
    slug: 'heic-to-jpg',
    category: 'image',
    icon: 'Smartphone',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 50 * 1024 * 1024,
    acceptedFormats: ['image/heic', 'image/heif'],
    processingType: 'client',
  },
  {
    id: 'svg-to-png',
    slug: 'svg-to-png',
    category: 'image',
    icon: 'ArrowRightLeft',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    acceptedFormats: ['image/svg+xml'],
    processingType: 'client',
  },
  {
    id: 'remove-bg',
    slug: 'remove-bg',
    category: 'image',
    icon: 'Eraser',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 25 * 1024 * 1024, // 25 MB
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    processingType: 'client',
  },

  // ---------- Video (5 tools) ----------
  {
    id: 'compress-video',
    slug: 'compress',
    category: 'video',
    icon: 'Minimize2',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 500 * 1024 * 1024, // 500 MB
    acceptedFormats: ['video/mp4', 'video/webm', 'video/quicktime'],
    processingType: 'client',
  },
  {
    id: 'trim-video',
    slug: 'trim',
    category: 'video',
    icon: 'Scissors',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 500 * 1024 * 1024,
    acceptedFormats: ['video/mp4', 'video/webm', 'video/quicktime'],
    processingType: 'client',
  },
  {
    id: 'video-to-gif',
    slug: 'to-gif',
    category: 'video',
    icon: 'Film',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 200 * 1024 * 1024, // 200 MB
    acceptedFormats: ['video/mp4', 'video/webm'],
    processingType: 'client',
  },
  {
    id: 'video-to-mp3',
    slug: 'to-mp3',
    category: 'video',
    icon: 'Music',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 500 * 1024 * 1024,
    acceptedFormats: ['video/mp4', 'video/webm', 'video/quicktime'],
    processingType: 'client',
  },
  {
    id: 'screen-recorder',
    slug: 'screen-recorder',
    category: 'video',
    icon: 'Monitor',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 0,
    acceptedFormats: [],
    processingType: 'none',
  },

  // ---------- Audio (3 tools) ----------
  {
    id: 'audio-cutter',
    slug: 'cutter',
    category: 'audio',
    icon: 'Scissors',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 100 * 1024 * 1024,
    acceptedFormats: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac'],
    processingType: 'client',
  },
  {
    id: 'audio-converter',
    slug: 'converter',
    category: 'audio',
    icon: 'ArrowRightLeft',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 100 * 1024 * 1024,
    acceptedFormats: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac'],
    processingType: 'client',
  },
  {
    id: 'voice-recorder',
    slug: 'voice-recorder',
    category: 'audio',
    icon: 'Mic',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 0,
    acceptedFormats: [],
    processingType: 'none',
  },

  // ---------- Text (5 tools) ----------
  {
    id: 'word-counter',
    slug: 'word-counter',
    category: 'text',
    icon: 'Hash',
    isAvailable: true,
    isPremium: false,
    maxFileSize: 0,
    acceptedFormats: [],
    processingType: 'none',
  },
  {
    id: 'lorem-ipsum',
    slug: 'lorem-ipsum',
    category: 'text',
    icon: 'AlignLeft',
    isAvailable: true,
    isPremium: false,
    maxFileSize: 0,
    acceptedFormats: [],
    processingType: 'none',
  },
  {
    id: 'case-converter',
    slug: 'case-converter',
    category: 'text',
    icon: 'CaseSensitive',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 0,
    acceptedFormats: [],
    processingType: 'none',
  },
  {
    id: 'diff-checker',
    slug: 'diff-checker',
    category: 'text',
    icon: 'GitCompare',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 0,
    acceptedFormats: [],
    processingType: 'none',
  },
  {
    id: 'markdown-editor',
    slug: 'markdown-editor',
    category: 'text',
    icon: 'FileCode',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 0,
    acceptedFormats: [],
    processingType: 'none',
  },

  // ---------- Developer (8 tools) ----------
  {
    id: 'json-formatter',
    slug: 'json-formatter',
    category: 'developer',
    icon: 'Braces',
    isAvailable: true,
    isPremium: false,
    maxFileSize: 0,
    acceptedFormats: [],
    processingType: 'none',
  },
  {
    id: 'base64',
    slug: 'base64',
    category: 'developer',
    icon: 'Binary',
    isAvailable: true,
    isPremium: false,
    maxFileSize: 10 * 1024 * 1024,
    acceptedFormats: [],
    processingType: 'none',
  },
  {
    id: 'regex-tester',
    slug: 'regex-tester',
    category: 'developer',
    icon: 'Regex',
    isAvailable: true,
    isPremium: false,
    maxFileSize: 0,
    acceptedFormats: [],
    processingType: 'none',
  },
  {
    id: 'color-picker',
    slug: 'color-picker',
    category: 'developer',
    icon: 'Palette',
    isAvailable: true,
    isPremium: false,
    maxFileSize: 0,
    acceptedFormats: [],
    processingType: 'none',
  },
  {
    id: 'qr-code',
    slug: 'qr-code',
    category: 'developer',
    icon: 'QrCode',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 0,
    acceptedFormats: [],
    processingType: 'none',
  },
  {
    id: 'hex-rgb',
    slug: 'hex-rgb',
    category: 'developer',
    icon: 'Pipette',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 0,
    acceptedFormats: [],
    processingType: 'none',
  },
  {
    id: 'url-encoder',
    slug: 'url-encoder',
    category: 'developer',
    icon: 'Link',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 0,
    acceptedFormats: [],
    processingType: 'none',
  },
  {
    id: 'timestamp',
    slug: 'timestamp',
    category: 'developer',
    icon: 'Clock',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 0,
    acceptedFormats: [],
    processingType: 'none',
  },

  // ---------- YouTube (2 tools) ----------
  {
    id: 'youtube-thumbnail',
    slug: 'thumbnail',
    category: 'youtube',
    icon: 'Image',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 0,
    acceptedFormats: [],
    processingType: 'server',
  },
  {
    id: 'youtube-transcript',
    slug: 'transcript',
    category: 'youtube',
    icon: 'Subtitles',
    isAvailable: false,
    isPremium: false,
    maxFileSize: 0,
    acceptedFormats: [],
    processingType: 'server',
  },
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all tools in a specific category
 */
export function getToolsByCategory(category: ToolCategoryId): Tool[] {
  return tools.filter((t) => t.category === category)
}

/**
 * Get a single tool by its category and slug
 */
export function getToolBySlug(category: ToolCategoryId, slug: string): Tool | undefined {
  return tools.find((t) => t.category === category && t.slug === slug)
}

/**
 * Get all tools marked as available (implemented)
 */
export function getAvailableTools(): Tool[] {
  return tools.filter((t) => t.isAvailable)
}

/**
 * Get all categories
 */
export function getAllCategories(): ToolCategory[] {
  return categories
}

/**
 * Get top 8 popular tools (by estimated search volume / demand)
 * Order: merge PDF, compress PDF, compress image, remove bg, video to MP3, word counter, JSON formatter, QR code
 */
export function getPopularTools(): Tool[] {
  const popularIds = [
    'merge-pdf',
    'compress-pdf',
    'compress-image',
    'remove-bg',
    'video-to-mp3',
    'word-counter',
    'json-formatter',
    'qr-code',
  ]
  return popularIds
    .map((id) => tools.find((t) => t.id === id))
    .filter((t): t is Tool => t !== undefined)
}

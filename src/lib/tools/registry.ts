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

  // ---------- Video (5 tools) ----------
  { id: 'compress-video', slug: 'compress', category: 'video', icon: 'Minimize2', isAvailable: true, isPremium: false, maxFileSize: 500 * 1024 * 1024, acceptedFormats: ['video/mp4', 'video/webm', 'video/quicktime'], processingType: 'client' },
  { id: 'trim-video', slug: 'trim', category: 'video', icon: 'Scissors', isAvailable: true, isPremium: false, maxFileSize: 500 * 1024 * 1024, acceptedFormats: ['video/mp4', 'video/webm', 'video/quicktime'], processingType: 'client' },
  { id: 'video-to-gif', slug: 'to-gif', category: 'video', icon: 'Film', isAvailable: true, isPremium: false, maxFileSize: 200 * 1024 * 1024, acceptedFormats: ['video/mp4', 'video/webm'], processingType: 'client' },
  { id: 'video-to-mp3', slug: 'to-mp3', category: 'video', icon: 'Music', isAvailable: true, isPremium: false, maxFileSize: 500 * 1024 * 1024, acceptedFormats: ['video/mp4', 'video/webm', 'video/quicktime'], processingType: 'client' },
  { id: 'screen-recorder', slug: 'screen-recorder', category: 'video', icon: 'Monitor', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },

  // ---------- Audio (3 tools) ----------
  { id: 'audio-cutter', slug: 'cutter', category: 'audio', icon: 'Scissors', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac'], processingType: 'client' },
  { id: 'audio-converter', slug: 'converter', category: 'audio', icon: 'ArrowRightLeft', isAvailable: true, isPremium: false, maxFileSize: 100 * 1024 * 1024, acceptedFormats: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac'], processingType: 'client' },
  { id: 'voice-recorder', slug: 'voice-recorder', category: 'audio', icon: 'Mic', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },

  // ---------- Text (5 tools) ----------
  { id: 'word-counter', slug: 'word-counter', category: 'text', icon: 'Hash', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'lorem-ipsum', slug: 'lorem-ipsum', category: 'text', icon: 'AlignLeft', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'case-converter', slug: 'case-converter', category: 'text', icon: 'CaseSensitive', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'diff-checker', slug: 'diff-checker', category: 'text', icon: 'GitCompare', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'markdown-editor', slug: 'markdown-editor', category: 'text', icon: 'FileCode', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },

  // ---------- Developer (8 tools) ----------
  { id: 'json-formatter', slug: 'json-formatter', category: 'developer', icon: 'Braces', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'base64', slug: 'base64', category: 'developer', icon: 'Binary', isAvailable: true, isPremium: false, maxFileSize: 10 * 1024 * 1024, acceptedFormats: [], processingType: 'none' },
  { id: 'regex-tester', slug: 'regex-tester', category: 'developer', icon: 'Regex', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'color-picker', slug: 'color-picker', category: 'developer', icon: 'Palette', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'qr-code', slug: 'qr-code', category: 'developer', icon: 'QrCode', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'hex-rgb', slug: 'hex-rgb', category: 'developer', icon: 'Pipette', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'url-encoder', slug: 'url-encoder', category: 'developer', icon: 'Link', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'timestamp', slug: 'timestamp', category: 'developer', icon: 'Clock', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'password-generator', slug: 'password-generator', category: 'developer', icon: 'Key', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'hash-generator', slug: 'hash-generator', category: 'developer', icon: 'Fingerprint', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'uuid-generator', slug: 'uuid-generator', category: 'developer', icon: 'Shuffle', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'jwt-decoder', slug: 'jwt-decoder', category: 'developer', icon: 'ShieldCheck', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'css-minifier', slug: 'css-minifier', category: 'developer', icon: 'FileCode', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },
  { id: 'sql-formatter', slug: 'sql-formatter', category: 'developer', icon: 'Database', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'none' },

  // ---------- YouTube (2 tools) ----------
  { id: 'youtube-thumbnail', slug: 'thumbnail', category: 'youtube', icon: 'Image', isAvailable: true, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'client' },
  { id: 'youtube-transcript', slug: 'transcript', category: 'youtube', icon: 'Subtitles', isAvailable: false, isPremium: false, maxFileSize: 0, acceptedFormats: [], processingType: 'server' },
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
  const popularIds = ['pdf-organizer', 'compress-pdf', 'image-converter', 'image-editor', 'video-to-mp3', 'word-counter', 'json-formatter', 'qr-code']
  return popularIds.map((id) => tools.find((t) => t.id === id)).filter((t): t is Tool => t !== undefined)
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
}

export function getCategoryColor(id: ToolCategoryId): string {
  return categoryColorMap[id] ?? '#6366F1'
}

const categoryClassesMap: Record<ToolCategoryId, { text: string; bg: string; border: string; hoverBorder: string; hoverText: string; card: string; cardHover: string }> = {
  pdf:       { text: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/20', hoverBorder: 'hover:border-[#EF4444]/40', hoverText: 'hover:text-[#EF4444]', card: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20', cardHover: 'hover:border-[#EF4444]/40' },
  image:     { text: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/20', hoverBorder: 'hover:border-[#22C55E]/40', hoverText: 'hover:text-[#22C55E]', card: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20', cardHover: 'hover:border-[#22C55E]/40' },
  video:     { text: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/20', hoverBorder: 'hover:border-[#8B5CF6]/40', hoverText: 'hover:text-[#8B5CF6]', card: 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20', cardHover: 'hover:border-[#8B5CF6]/40' },
  audio:     { text: 'text-[#F97316]', bg: 'bg-[#F97316]/10', border: 'border-[#F97316]/20', hoverBorder: 'hover:border-[#F97316]/40', hoverText: 'hover:text-[#F97316]', card: 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20', cardHover: 'hover:border-[#F97316]/40' },
  text:      { text: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/20', hoverBorder: 'hover:border-[#3B82F6]/40', hoverText: 'hover:text-[#3B82F6]', card: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20', cardHover: 'hover:border-[#3B82F6]/40' },
  developer: { text: 'text-[#14B8A6]', bg: 'bg-[#14B8A6]/10', border: 'border-[#14B8A6]/20', hoverBorder: 'hover:border-[#14B8A6]/40', hoverText: 'hover:text-[#14B8A6]', card: 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/20', cardHover: 'hover:border-[#14B8A6]/40' },
  youtube:   { text: 'text-[#EC4899]', bg: 'bg-[#EC4899]/10', border: 'border-[#EC4899]/20', hoverBorder: 'hover:border-[#EC4899]/40', hoverText: 'hover:text-[#EC4899]', card: 'bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/20', cardHover: 'hover:border-[#EC4899]/40' },
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

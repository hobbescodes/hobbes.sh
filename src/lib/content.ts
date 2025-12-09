import type { BlogPost } from '@/types'

/**
 * Import all markdown files at build time using Vite's import.meta.glob
 * This bundles the content directly into the JavaScript, eliminating
 * the need for runtime file system access.
 */
const pageFiles = import.meta.glob('/content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const blogFiles = import.meta.glob('/content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/**
 * Simple browser-compatible frontmatter parser
 * Parses YAML frontmatter from markdown files without Node.js dependencies
 */
interface FrontmatterResult {
  data: Record<string, unknown>
  content: string
}

function parseFrontmatter(raw: string): FrontmatterResult {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
  const match = raw.match(frontmatterRegex)

  if (!match) {
    return { data: {}, content: raw }
  }

  const [, frontmatter, content] = match
  const data: Record<string, unknown> = {}

  // Parse simple YAML-like frontmatter
  const lines = frontmatter.split('\n')
  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const key = line.slice(0, colonIndex).trim()
    let value: unknown = line.slice(colonIndex + 1).trim()

    // Handle arrays like [tag1, tag2]
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim())
    }
    // Handle dates (YYYY-MM-DD format)
    else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // Keep as string for consistency
      value = value
    }

    if (key) {
      data[key] = value
    }
  }

  return { data, content }
}

/**
 * Format a date to YYYY-MM-DD string
 */
function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    return date
  }
  return date.toISOString().split('T')[0]
}

/**
 * Calculate reading time based on word count
 * Assumes average reading speed of 200 words per minute
 */
function calculateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} min read`
}

/**
 * Metadata for blog listing (without full content)
 */
export interface BlogPostMeta {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  readingTime: string
}

/**
 * Load a markdown page (about, contact) and return as string[]
 * Content is bundled at build time via import.meta.glob
 */
export function loadPageContent(filename: string): string[] {
  const key = `/content/${filename}`
  const raw = pageFiles[key]

  if (!raw) {
    throw new Error(`Content file not found: ${filename}`)
  }

  return raw.split('\n')
}

/**
 * Load a blog post by slug
 * Content is bundled at build time via import.meta.glob
 */
export function loadBlogPost(slug: string): BlogPost | null {
  const key = `/content/blog/${slug}.md`
  const raw = blogFiles[key]

  if (!raw) {
    return null
  }

  const { data, content } = parseFrontmatter(raw)

  return {
    slug,
    title: (data.title as string) || slug,
    description: (data.description as string) || '',
    date: data.date ? formatDate(data.date as string | Date) : '',
    tags: (data.tags as string[]) || [],
    readingTime: (data.readingTime as string) || calculateReadingTime(content),
    content: content.split('\n'),
  }
}

/**
 * Get all blog posts metadata, sorted by date (newest first)
 * Content is bundled at build time via import.meta.glob
 */
export function getAllBlogPosts(): BlogPostMeta[] {
  const posts = Object.entries(blogFiles).map(([filePath, raw]) => {
    const slug = filePath.replace('/content/blog/', '').replace('.md', '')
    const { data, content } = parseFrontmatter(raw)

    return {
      slug,
      title: (data.title as string) || slug,
      description: (data.description as string) || '',
      date: data.date ? formatDate(data.date as string | Date) : '',
      tags: (data.tags as string[]) || [],
      readingTime: (data.readingTime as string) || calculateReadingTime(content),
    }
  })

  // Sort by date, newest first
  return posts.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })
}

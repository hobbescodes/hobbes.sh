import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { createServerFn } from '@tanstack/react-start'
import type { BlogPost } from '@/types'

/**
 * Get the content directory path
 */
function getContentDir(): string {
  return path.join(process.cwd(), 'content')
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
 * Server-only function using createServerFn
 */
export const loadPageContent = createServerFn({ method: 'GET' })
  .inputValidator((filename: string) => filename)
  .handler(async ({ data: filename }): Promise<string[]> => {
    const filePath = path.join(getContentDir(), filename)

    if (!fs.existsSync(filePath)) {
      throw new Error(`Content file not found: ${filename}`)
    }

    const raw = fs.readFileSync(filePath, 'utf-8')
    return raw.split('\n')
  })

/**
 * Load a blog post by slug
 * Server-only function using createServerFn
 */
export const loadBlogPost = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<BlogPost | null> => {
    const filePath = path.join(getContentDir(), 'blog', `${slug}.md`)

    if (!fs.existsSync(filePath)) {
      return null
    }

    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)

    return {
      slug,
      title: data.title || slug,
      description: data.description || '',
      date: data.date ? formatDate(data.date) : '',
      tags: data.tags || [],
      readingTime: data.readingTime || calculateReadingTime(content),
      content: content.split('\n'),
    }
  })

/**
 * Get all blog posts metadata, sorted by date (newest first)
 * Server-only function using createServerFn
 */
export const getAllBlogPosts = createServerFn({ method: 'GET' }).handler(
  async (): Promise<BlogPostMeta[]> => {
    const blogDir = path.join(getContentDir(), 'blog')

    if (!fs.existsSync(blogDir)) {
      return []
    }

    const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md'))

    const posts = files.map((filename) => {
      const slug = filename.replace('.md', '')
      const filePath = path.join(blogDir, filename)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(raw)

      return {
        slug,
        title: data.title || slug,
        description: data.description || '',
        date: data.date ? formatDate(data.date) : '',
        tags: data.tags || [],
        readingTime: data.readingTime || calculateReadingTime(content),
      }
    })

    // Sort by date, newest first
    return posts.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })
  }
)

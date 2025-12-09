import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Terminal } from '@/components/terminal'
import { Buffer } from '@/components/editor'
import { OilEntry } from '@/components/oil'
import { useNavigation } from '@/context/NavigationContext'
import { getAllBlogPosts } from '@/content/blog/posts'
import type { RouteEntry } from '@/types'

export const Route = createFileRoute('/blog/')({
  component: BlogPage,
  validateSearch: (search: Record<string, unknown>): { from?: string } => ({
    from: typeof search.from === 'string' ? search.from : undefined,
  }),
})

function BlogPage() {
  const navigate = useNavigate()
  const { mode } = useNavigation()
  const { from } = Route.useSearch()
  
  const posts = getAllBlogPosts()
  
  // Find the index of the entry we came from (if any)
  // Index 0 is parent (..), so post entries start at 1
  const getInitialIndex = () => {
    if (!from) return 0
    const slug = from.split('/').filter(Boolean)[1] // e.g., "/blog/foo" -> "foo"
    const index = posts.findIndex((p) => p.slug === slug)
    return index >= 0 ? index + 1 : 0 // +1 because parent is index 0
  }
  
  const [selectedIndex, setSelectedIndex] = useState(getInitialIndex)

  // Convert posts to RouteEntry format for OilEntry component
  const postEntries: RouteEntry[] = posts.map((p) => ({
    name: p.slug,
    displayName: `${p.slug}.md`,
    type: 'file',
    path: `/blog/${p.slug}`,
  }))

  // Total items: parent (..) + posts
  const totalItems = 1 + posts.length

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Don't handle navigation keys when in COMMAND or SEARCH mode
      if (mode !== 'NORMAL') return

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, totalItems - 1))
          break
        case 'k':
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex === 0) {
            // Navigate to parent with current path as 'from'
            navigate({ to: '/', search: { from: '/blog' } })
          } else {
            const post = posts[selectedIndex - 1]
            if (post) {
              navigate({ to: '/blog/$slug', params: { slug: post.slug } })
            }
          }
          break
        case '-':
          e.preventDefault()
          navigate({ to: '/', search: { from: '/blog' } })
          break
      }
    },
    [selectedIndex, navigate, totalItems, posts, mode]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Line calculation: header (1) + entries
  const currentLine = selectedIndex + 2
  const totalLines = totalItems + 5

  return (
    <Terminal
      title="👻 ~/hobbescodes/blog/"
      filepath="~/hobbescodes/blog/"
      filetype="oil"
      line={currentLine}
      col={1}
    >
      <Buffer lineCount={totalLines} currentLine={currentLine}>
        <div className="flex flex-col leading-[1.6]">
          {/* Directory header */}
          <div className="font-bold" style={{ color: 'var(--blue)' }}>
            ~/hobbescodes/blog/
          </div>

          {/* Parent directory entry */}
          <OilEntry
            entry={{ name: '..', displayName: '../', type: 'directory', path: '/' }}
            isSelected={selectedIndex === 0}
            isParent
          />

          {/* Blog post entries */}
          {postEntries.map((entry, index) => (
            <OilEntry
              key={entry.path}
              entry={entry}
              isSelected={selectedIndex === index + 1}
            >
              {/* Post metadata */}
              <span
                className="ml-2 text-xs"
                style={{ color: 'var(--overlay0)' }}
              >
                {posts[index].date} | {posts[index].readingTime}
              </span>
            </OilEntry>
          ))}
        </div>
      </Buffer>
    </Terminal>
  )
}

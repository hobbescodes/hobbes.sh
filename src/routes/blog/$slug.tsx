import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Terminal } from '@/components/terminal'
import { Buffer } from '@/components/editor'
import { useNavigation } from '@/context/NavigationContext'
import { getBlogPost } from '@/content/blog/posts'
import { SyntaxHighlight } from '@/components/ui/SyntaxHighlight'

export const Route = createFileRoute('/blog/$slug')({
  component: BlogPostPage,
  loader: ({ params }) => {
    const post = getBlogPost(params.slug)
    if (!post) {
      throw notFound()
    }
    return { post }
  },
  notFoundComponent: () => {
    const navigate = useNavigate()
    const { mode } = useNavigation()

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (mode !== 'NORMAL') return
        if (e.key === '-') {
          e.preventDefault()
          navigate({ to: '/blog', search: {} })
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [navigate, mode])

    return (
      <Terminal
        title="👻 ~/hobbescodes/blog/404.md"
        filepath="~/hobbescodes/blog/404.md"
        filetype="markdown"
        line={1}
        col={1}
      >
        <Buffer lineCount={10} currentLine={1}>
          <div style={{ color: 'var(--text)' }}>
            <div style={{ color: 'var(--red)', fontWeight: 'bold' }}>
              # Post Not Found
            </div>
            <div>&nbsp;</div>
            <div>The blog post you&apos;re looking for doesn&apos;t exist.</div>
            <div>&nbsp;</div>
          </div>
        </Buffer>
      </Terminal>
    )
  },
})

function BlogPostPage() {
  const navigate = useNavigate()
  const { mode } = useNavigation()
  const { post } = Route.useLoaderData()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'NORMAL') return
      if (e.key === '-') {
        e.preventDefault()
        navigate({ to: '/blog', search: { from: `/blog/${post.slug}` } })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, mode, post.slug])

  // Build content lines with metadata header
  const metadataLines = [
    `# ${post.title}`,
    '',
    `  Date: ${post.date}`,
    `  Tags: ${post.tags.join(', ')}`,
    `  Reading time: ${post.readingTime}`,
    '',
    '---',
    '',
  ]

  const allContent = [...metadataLines, ...post.content]

  return (
    <Terminal
      title={`👻 ~/hobbescodes/blog/${post.slug}.md`}
      filepath={`~/hobbescodes/blog/${post.slug}.md`}
      filetype="markdown"
      line={1}
      col={1}
    >
      <Buffer lineCount={allContent.length + 3} currentLine={1}>
        <SyntaxHighlight content={allContent} filetype="markdown" />
      </Buffer>
    </Terminal>
  )
}

import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Terminal } from '@/components/terminal'
import { Buffer } from '@/components/editor'
import { loadBlogPost } from '@/lib/content'
import { SyntaxHighlight } from '@/components/ui/SyntaxHighlight'
import { useBufferNavigation } from '@/hooks/useBufferNavigation'

export const Route = createFileRoute('/blog/$slug')({
  component: BlogPostPage,
  loader: ({ params }) => {
    const post = loadBlogPost(params.slug)
    if (!post) {
      throw notFound()
    }
    return { post }
  },
  notFoundComponent: NotFoundPage,
})

function NotFoundPage() {
  const navigate = useNavigate()

  const content = useMemo(
    () => ['# Post Not Found', '', "The blog post you're looking for doesn't exist.", ''],
    []
  )

  const { currentLine, setCurrentLine, getLineProps } = useBufferNavigation({
    content,
    onNavigateBack: () => navigate({ to: '/blog', search: {} }),
  })

  const handleLineDoubleClick = (lineNumber: number) => {
    const lineProps = getLineProps(lineNumber - 1)
    if (lineProps.url) {
      window.open(lineProps.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Terminal
      title="👻 ~/hobbescodes/blog/404.md"
      filepath="~/hobbescodes/blog/404.md"
      filetype="markdown"
      line={currentLine}
      col={1}
    >
      <Buffer
        lineCount={10}
        currentLine={currentLine}
        contentLineCount={content.length}
        onLineClick={setCurrentLine}
        onLineDoubleClick={handleLineDoubleClick}
      >
        <SyntaxHighlight content={content} filetype="markdown" getLineProps={getLineProps} />
      </Buffer>
    </Terminal>
  )
}

function BlogPostPage() {
  const navigate = useNavigate()
  const { post } = Route.useLoaderData()

  // Build content lines with metadata header
  const allContent = useMemo(() => {
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
    return [...metadataLines, ...post.content]
  }, [post])

  const { currentLine, setCurrentLine, getLineProps } = useBufferNavigation({
    content: allContent,
    onNavigateBack: () => navigate({ to: '/blog', search: { from: `/blog/${post.slug}` } }),
  })

  const handleLineDoubleClick = (lineNumber: number) => {
    const lineProps = getLineProps(lineNumber - 1)
    if (lineProps.url) {
      window.open(lineProps.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Terminal
      title={`👻 ~/hobbescodes/blog/${post.slug}.md`}
      filepath={`~/hobbescodes/blog/${post.slug}.md`}
      filetype="markdown"
      line={currentLine}
      col={1}
    >
      <Buffer
        lineCount={allContent.length + 3}
        currentLine={currentLine}
        contentLineCount={allContent.length}
        onLineClick={setCurrentLine}
        onLineDoubleClick={handleLineDoubleClick}
      >
        <SyntaxHighlight content={allContent} filetype="markdown" getLineProps={getLineProps} />
      </Buffer>
    </Terminal>
  )
}

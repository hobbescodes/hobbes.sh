import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Terminal } from '@/components/terminal'
import { Buffer } from '@/components/editor'
import { SyntaxHighlight } from '@/components/ui/SyntaxHighlight'
import { useBufferNavigation } from '@/hooks/useBufferNavigation'
import { loadPageContent } from '@/lib/content'

export const Route = createFileRoute('/about')({
  component: AboutPage,
  loader: () => {
    const content = loadPageContent('about.md')
    return { content }
  },
})

function AboutPage() {
  const navigate = useNavigate()
  const { content } = Route.useLoaderData()

  const { currentLine, getLineProps } = useBufferNavigation({
    content,
    onNavigateBack: () => navigate({ to: '/', search: { from: '/about' } }),
  })

  return (
    <Terminal
      title="👻 ~/hobbescodes/about.md"
      filepath="~/hobbescodes/about.md"
      filetype="markdown"
      line={currentLine}
      col={1}
    >
      <Buffer lineCount={content.length + 3} currentLine={currentLine} contentLineCount={content.length}>
        <SyntaxHighlight content={content} filetype="markdown" getLineProps={getLineProps} />
      </Buffer>
    </Terminal>
  )
}

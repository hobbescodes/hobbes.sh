import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Terminal } from '@/components/terminal'
import { Buffer } from '@/components/editor'
import { SyntaxHighlight } from '@/components/ui/SyntaxHighlight'
import { useBufferNavigation } from '@/hooks/useBufferNavigation'
import { loadPageContent } from '@/lib/content'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
  loader: async () => {
    const content = await loadPageContent({ data: 'contact.md' })
    return { content }
  },
})

function ContactPage() {
  const navigate = useNavigate()
  const { content } = Route.useLoaderData()

  const { currentLine, getLineProps } = useBufferNavigation({
    content,
    onNavigateBack: () => navigate({ to: '/', search: { from: '/contact' } }),
  })

  return (
    <Terminal
      title="👻 ~/hobbescodes/contact.md"
      filepath="~/hobbescodes/contact.md"
      filetype="markdown"
      line={currentLine}
      col={1}
    >
      <Buffer lineCount={content.length + 3} currentLine={currentLine}>
        <SyntaxHighlight content={content} filetype="markdown" getLineProps={getLineProps} />
      </Buffer>
    </Terminal>
  )
}

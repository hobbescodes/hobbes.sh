import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Terminal } from '@/components/terminal'
import { Buffer, BufferLine } from '@/components/editor'
import { useBufferNavigation } from '@/hooks/useBufferNavigation'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

const content = [
  '# Contact',
  '',
  'Feel free to reach out!',
  '',
  '',
  '## Email',
  '',
  '  hello@hobbescodes.dev',
  '',
  '',
  '## Social',
  '',
  '  GitHub    https://github.com/hobbescodes',
  '  Twitter   https://twitter.com/hobbescodes',
  '  LinkedIn  https://www.linkedin.com/in/jakobhauble/',
  '',
  '',
  '## Timezone',
  '',
  '  UTC-5 (Eastern Time)',
  '  Usually available 9am - 6pm ET',
  '',
  '',
  '## Availability',
  '',
  "I'm always interested in:",
  '  - Interesting open source projects',
  '  - Collaboration opportunities',
  '  - Speaking at events',
  '  - Coffee chats about tech',
  '',
  '',
  '## Response Time',
  '',
  'I try to respond within 24-48 hours.',
  'For urgent matters, Twitter DMs work best.',
  '',
]

function ContactPage() {
  const navigate = useNavigate()

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
        <div style={{ color: 'var(--text)' }}>
          {content.map((line, i) => {
            const { isSelected, hasLink } = getLineProps(i)
            return (
              <BufferLine key={i} isSelected={isSelected} hasLink={hasLink}>
                <span
                  style={{
                    color: line.startsWith('# ')
                      ? 'var(--red)'
                      : line.startsWith('## ')
                        ? 'var(--peach)'
                        : line.includes('https://')
                          ? 'var(--blue)'
                          : line.startsWith('  - ')
                            ? 'var(--green)'
                            : undefined,
                    fontWeight: line.startsWith('#') ? 'bold' : undefined,
                  }}
                >
                  {line || '\u00A0'}
                </span>
              </BufferLine>
            )
          })}
        </div>
      </Buffer>
    </Terminal>
  )
}

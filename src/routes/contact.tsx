import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Terminal } from '@/components/terminal'
import { Buffer } from '@/components/editor'
import { NavigationHint } from '@/components/ui/NavigationHint'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

function ContactPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '-') {
        e.preventDefault()
        navigate({ to: '/' })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

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
    '  LinkedIn  https://linkedin.com/in/hobbescodes',
    '  Bluesky   https://bsky.app/profile/hobbescodes.dev',
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
  ]

  return (
    <Terminal
      title="👻 ~/hobbescodes/contact.md"
      filepath="~/hobbescodes/contact.md"
      filetype="markdown"
      mode="NORMAL"
      line={1}
      col={1}
    >
      <Buffer lineCount={content.length + 3} currentLine={1}>
        <div style={{ color: 'var(--text)' }}>
          {content.map((line, i) => (
            <div
              key={i}
              style={{
                color: line.startsWith('# ') ? 'var(--red)' :
                  line.startsWith('## ') ? 'var(--peach)' :
                  line.includes('https://') ? 'var(--blue)' :
                  line.startsWith('  - ') ? 'var(--green)' :
                  undefined,
                fontWeight: line.startsWith('#') ? 'bold' : undefined,
                fontSize: line.startsWith('# ') ? '1.125rem' : undefined,
              }}
            >
              {line || '\u00A0'}
            </div>
          ))}
        </div>
        <NavigationHint />
      </Buffer>
    </Terminal>
  )
}

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Terminal } from '@/components/terminal'
import { Buffer } from '@/components/editor'
import { useNavigation } from '@/context/NavigationContext'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

function ContactPage() {
  const navigate = useNavigate()
  const { mode } = useNavigation()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'NORMAL') return
      if (e.key === '-') {
        e.preventDefault()
        navigate({ to: '/', search: { from: '/contact' } })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, mode])

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
    '  Discord   hobbescodes',
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

  return (
    <Terminal
      title="👻 ~/hobbescodes/contact.md"
      filepath="~/hobbescodes/contact.md"
      filetype="markdown"
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
              }}
            >
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      </Buffer>
    </Terminal>
  )
}

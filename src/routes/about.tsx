import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Terminal } from '@/components/terminal'
import { Buffer } from '@/components/editor'
import { NavigationHint } from '@/components/ui/NavigationHint'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
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
    '# About Me',
    '',
    '## whoami',
    '',
    'Software engineer and tiger enthusiast.',
    'Building things on the internet since the early days.',
    '',
    'I love working with modern web technologies and',
    'spending way too much time perfecting my terminal setup.',
    '',
    '',
    '## Skills',
    '',
    '### Languages',
    '  - TypeScript / JavaScript',
    '  - Rust',
    '  - Go',
    '  - Python',
    '',
    '### Frontend',
    '  - React / Next.js / TanStack',
    '  - Tailwind CSS',
    '  - Vue / Nuxt',
    '',
    '### Backend',
    '  - Node.js / Bun',
    '  - PostgreSQL / Redis',
    '  - REST / GraphQL / tRPC',
    '',
    '### Tools',
    '  - Neovim (btw)',
    '  - Ghostty / Terminal workflows',
    '  - Git / GitHub',
    '  - Docker / Kubernetes',
    '',
    '',
    '## Philosophy',
    '',
    'I believe in building software that is:',
    '  - Fast and performant',
    '  - Accessible to everyone',
    '  - A joy to use',
    '  - Open source when possible',
    '',
  ]

  return (
    <Terminal
      title="👻 ~/hobbescodes/about.md"
      filepath="~/hobbescodes/about.md"
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
                  line.startsWith('### ') ? 'var(--yellow)' :
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

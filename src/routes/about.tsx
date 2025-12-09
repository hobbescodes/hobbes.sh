import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Terminal } from '@/components/terminal'
import { Buffer } from '@/components/editor'
import { useNavigation } from '@/context/NavigationContext'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  const navigate = useNavigate()
  const { mode } = useNavigation()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'NORMAL') return
      if (e.key === '-') {
        e.preventDefault()
        navigate({ to: '/', search: { from: '/about' } })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, mode])

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
    '## Currently Working On',
    '',
    '  - This terminal-inspired personal website',
    '  - Open source CLI tools in Rust',
    '  - Contributing to the Neovim ecosystem',
    '  - Learning about systems programming',
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
    '## Fun Facts',
    '',
    '  - My online persona is a tiger (hence HobbesCodes)',
    '  - I have strong opinions about terminal fonts',
    '  - I use Catppuccin Mocha for everything',
    '  - I believe in keyboard-driven workflows',
    '  - My .dotfiles repo has more commits than most projects',
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

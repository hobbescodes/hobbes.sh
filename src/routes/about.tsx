import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Terminal } from '@/components/terminal'
import { Buffer, BufferLine } from '@/components/editor'
import { useBufferNavigation } from '@/hooks/useBufferNavigation'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

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

function AboutPage() {
  const navigate = useNavigate()

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
                        : line.startsWith('### ')
                          ? 'var(--yellow)'
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

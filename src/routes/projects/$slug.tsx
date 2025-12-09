import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Terminal } from '@/components/terminal'
import { Buffer } from '@/components/editor'
import { useNavigation } from '@/context/NavigationContext'

// Mock project data - same as index for now
const projects: Record<string, {
  name: string
  description: string
  url: string
  homepage?: string
  language: string
  stars: number
  forks: number
  topics: string[]
  updatedAt: string
}> = {
  'terminal-website': {
    name: 'terminal-website',
    description: 'A terminal-inspired personal website built with TanStack Start',
    url: 'https://github.com/hobbescodes/terminal-website',
    homepage: 'https://hobbescodes.dev',
    language: 'TypeScript',
    stars: 42,
    forks: 5,
    topics: ['react', 'typescript', 'terminal', 'portfolio'],
    updatedAt: '2024-12-01T00:00:00Z',
  },
  'nvim-config': {
    name: 'nvim-config',
    description: 'My Neovim configuration with LSP, Treesitter, and more',
    url: 'https://github.com/hobbescodes/nvim-config',
    language: 'Lua',
    stars: 128,
    forks: 23,
    topics: ['neovim', 'lua', 'dotfiles'],
    updatedAt: '2024-11-15T00:00:00Z',
  },
  'rust-cli-tools': {
    name: 'rust-cli-tools',
    description: 'A collection of useful CLI tools written in Rust',
    url: 'https://github.com/hobbescodes/rust-cli-tools',
    language: 'Rust',
    stars: 89,
    forks: 12,
    topics: ['rust', 'cli', 'tools'],
    updatedAt: '2024-10-20T00:00:00Z',
  },
}

export const Route = createFileRoute('/projects/$slug')({
  component: ProjectPage,
})

function ProjectPage() {
  const { slug } = Route.useParams()
  const navigate = useNavigate()
  const { mode } = useNavigation()
  const project = projects[slug]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'NORMAL') return
      if (e.key === '-') {
        e.preventDefault()
        navigate({ to: '/projects', search: { from: `/projects/${slug}` } })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, mode, slug])

  if (!project) {
    const content = [
      '# 404 - Project Not Found',
      '',
      `Could not find project: ${slug}`,
      '',
    ]

    return (
      <Terminal
        title={`👻 ~/hobbescodes/projects/${slug}.md`}
        filepath={`~/hobbescodes/projects/${slug}.md`}
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
                  color: line.startsWith('# ') ? 'var(--red)' : undefined,
                  fontWeight: line.startsWith('# ') ? 'bold' : undefined,
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

  const content = [
    `# ${project.name}`,
    '',
    project.description,
    '',
    '',
    '## Details',
    '',
    `  Language:    ${project.language}`,
    `  Stars:       ${project.stars}`,
    `  Forks:       ${project.forks}`,
    `  Updated:     ${new Date(project.updatedAt).toLocaleDateString()}`,
    '',
    '',
    '## Topics',
    '',
    ...project.topics.map(t => `  - ${t}`),
    '',
    '',
    '## Links',
    '',
    `  Repository:  ${project.url}`,
    ...(project.homepage ? [`  Homepage:    ${project.homepage}`] : []),
    '',
  ]

  return (
    <Terminal
      title={`👻 ~/hobbescodes/projects/${slug}.md`}
      filepath={`~/hobbescodes/projects/${slug}.md`}
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
                  line.startsWith('  - ') ? 'var(--teal)' :
                  line.includes('https://') ? 'var(--blue)' :
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

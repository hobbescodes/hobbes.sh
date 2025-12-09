import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Terminal } from '@/components/terminal'
import { Buffer } from '@/components/editor'
import { OilEntry } from '@/components/oil'
import { useOilNavigation } from '@/hooks/useOilNavigation'
import type { RouteEntry } from '@/types'

// Mock project data - structured for GitHub API compatibility
const projects = [
  {
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
  {
    name: 'nvim-config',
    description: 'My Neovim configuration with LSP, Treesitter, and more',
    url: 'https://github.com/hobbescodes/nvim-config',
    language: 'Lua',
    stars: 128,
    forks: 23,
    topics: ['neovim', 'lua', 'dotfiles'],
    updatedAt: '2024-11-15T00:00:00Z',
  },
  {
    name: 'rust-cli-tools',
    description: 'A collection of useful CLI tools written in Rust',
    url: 'https://github.com/hobbescodes/rust-cli-tools',
    language: 'Rust',
    stars: 89,
    forks: 12,
    topics: ['rust', 'cli', 'tools'],
    updatedAt: '2024-10-20T00:00:00Z',
  },
]

// Convert projects to RouteEntry format for OilEntry component
const projectEntries: RouteEntry[] = projects.map(p => ({
  name: p.name,
  displayName: `${p.name}.md`,
  type: 'file',
  path: `/projects/${p.name}`,
}))

export const Route = createFileRoute('/projects/')({
  component: ProjectsPage,
  validateSearch: (search: Record<string, unknown>): { from?: string } => ({
    from: typeof search.from === 'string' ? search.from : undefined,
  }),
})

function ProjectsPage() {
  const navigate = useNavigate()
  const { from } = Route.useSearch()
  
  // Find the index of the entry we came from (if any)
  // Index 0 is parent (..), so project entries start at 1
  const getInitialIndex = () => {
    if (!from) return 0
    const slug = from.split('/').filter(Boolean)[1] // e.g., "/projects/foo" -> "foo"
    const index = projects.findIndex((p) => p.name === slug)
    return index >= 0 ? index + 1 : 0 // +1 because parent is index 0
  }

  // Total items: parent (..) + projects
  const totalItems = 1 + projects.length

  const { selectedIndex, handleItemClick } = useOilNavigation({
    totalItems,
    initialIndex: getInitialIndex(),
    onNavigate: (index) => {
      if (index === 0) {
        navigate({ to: '/', search: { from: '/projects' } })
      } else {
        const project = projects[index - 1]
        if (project) {
          navigate({ to: '/projects/$slug', params: { slug: project.name } })
        }
      }
    },
    onNavigateToParent: () => navigate({ to: '/', search: { from: '/projects' } }),
  })

  // Line calculation: header (1) + entries
  const currentLine = selectedIndex + 2
  const totalLines = totalItems + 5
  // Content lines = header (1) + all entries
  const contentLines = 1 + totalItems

  return (
    <Terminal
      title="👻 ~/hobbescodes/projects/"
      filepath="~/hobbescodes/projects/"
      filetype="oil"
      line={currentLine}
      col={1}
    >
      <Buffer lineCount={totalLines} currentLine={currentLine} contentLineCount={contentLines}>
        <div className="flex flex-col leading-[1.6]">
          {/* Directory header */}
          <div className="font-bold" style={{ color: 'var(--blue)' }}>
            ~/hobbescodes/projects/
          </div>

          {/* Parent directory entry */}
          <OilEntry
            entry={{ name: '..', displayName: '../', type: 'directory', path: '/' }}
            isSelected={selectedIndex === 0}
            isParent
            onClick={() => handleItemClick(0)}
          />

          {/* Project entries */}
          {projectEntries.map((entry, index) => (
            <OilEntry
              key={entry.path}
              entry={entry}
              isSelected={selectedIndex === index + 1}
              onClick={() => handleItemClick(index + 1)}
            >
              {/* Project metadata */}
              <span 
                className="ml-2 text-xs"
                style={{ color: 'var(--overlay0)' }}
              >
                {projects[index].language} | ★ {projects[index].stars}
              </span>
            </OilEntry>
          ))}
        </div>
      </Buffer>
    </Terminal>
  )
}

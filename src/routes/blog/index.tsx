import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Terminal } from '@/components/terminal'
import { Buffer } from '@/components/editor'
import { OilEntry } from '@/components/oil'
import { NavigationHint } from '@/components/ui/NavigationHint'

export const Route = createFileRoute('/blog/')({
  component: BlogPage,
})

function BlogPage() {
  const navigate = useNavigate()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    switch (e.key) {
      case 'j':
      case 'ArrowDown':
      case 'k':
      case 'ArrowUp':
        // Only one item (parent), so no movement needed
        e.preventDefault()
        break
      case 'Enter':
      case '-':
        e.preventDefault()
        navigate({ to: '/' })
        break
      case 'g':
      case 'G':
        e.preventDefault()
        setSelectedIndex(0)
        break
    }
  }, [navigate])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const comingSoonLines = [
    '',
    '  Coming soon...',
    '',
    '  Blog posts will be added here once the',
    '  database integration is complete.',
    '',
    '  Stay tuned!',
    '',
  ]

  // Line calculation: header (1) + parent (1) + coming soon message
  const currentLine = 2
  const totalLines = 2 + comingSoonLines.length + 5

  return (
    <Terminal
      title="👻 ~/hobbescodes/blog/"
      filepath="~/hobbescodes/blog/"
      filetype="oil"
      mode="NORMAL"
      line={currentLine}
      col={1}
    >
      <Buffer lineCount={totalLines} currentLine={currentLine}>
        <div className="flex flex-col leading-[1.6]">
          {/* Directory header */}
          <div className="font-bold" style={{ color: 'var(--blue)' }}>
            ~/hobbescodes/blog/
          </div>

          {/* Parent directory entry */}
          <OilEntry
            entry={{ name: '..', displayName: '../', type: 'directory', path: '/' }}
            isSelected={selectedIndex === 0}
            isParent
          />

          {/* Coming soon message */}
          <div className="mt-4" style={{ color: 'var(--overlay1)' }}>
            {comingSoonLines.map((line, i) => (
              <div key={i}>{line || '\u00A0'}</div>
            ))}
          </div>

          {/* Navigation hint */}
          <NavigationHint />
        </div>
      </Buffer>
    </Terminal>
  )
}

import { type FC, useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { OilEntry } from './OilEntry'
import { useNavigation } from '@/context/NavigationContext'
import type { RouteEntry } from '@/types'
import { getParentPath } from '@/lib/routes'

interface OilNavigatorProps {
  entries: RouteEntry[]
  currentPath: string
  /** Initial selected index (defaults to 0) */
  initialIndex?: number
  /** Line number where oil section starts in the buffer (for computing currentLine) */
  startLine?: number
  /** Callback when current line changes (computed from startLine + selection) */
  onCurrentLineChange?: (line: number) => void
  showParent?: boolean
}

export const OilNavigator: FC<OilNavigatorProps> = ({
  entries,
  currentPath,
  initialIndex = 0,
  startLine = 1,
  onCurrentLineChange,
  showParent = true,
}) => {
  const navigate = useNavigate()
  const { mode, getCount, setCountBuffer } = useNavigation()
  
  // OilNavigator owns its selection state internally
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)
  
  // Create the full list including parent directory if applicable
  const hasParent = showParent && currentPath !== '/'
  const totalItems = hasParent ? entries.length + 1 : entries.length

  // Compute and report current line when selection changes
  // currentLine = startLine + 1 (for header) + selectedIndex
  const currentLine = startLine + 1 + selectedIndex
  
  // Report current line to parent via callback (legitimate external sync)
  useEffect(() => {
    onCurrentLineChange?.(currentLine)
  }, [currentLine, onCurrentLineChange])

  const handleNavigate = useCallback((index?: number) => {
    const targetIndex = index ?? selectedIndex
    if (hasParent && targetIndex === 0) {
      // Navigate to parent with current path as 'from'
      navigate({ 
        to: getParentPath(currentPath),
        search: { from: currentPath },
      })
    } else {
      const entryIndex = hasParent ? targetIndex - 1 : targetIndex
      const entry = entries[entryIndex]
      if (entry) {
        navigate({ to: entry.path, search: {} })
      }
    }
  }, [selectedIndex, hasParent, entries, navigate, currentPath])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    // Don't handle navigation keys when in COMMAND or SEARCH mode
    if (mode !== 'NORMAL') {
      return
    }

    switch (e.key) {
      case 'j':
      case 'ArrowDown':
        e.preventDefault()
        {
          const count = getCount()
          setSelectedIndex((prev) => Math.min(prev + count, totalItems - 1))
          setCountBuffer('')
        }
        break
      case 'k':
      case 'ArrowUp':
        e.preventDefault()
        {
          const count = getCount()
          setSelectedIndex((prev) => Math.max(prev - count, 0))
          setCountBuffer('')
        }
        break
      case 'Enter':
        e.preventDefault()
        setCountBuffer('')
        handleNavigate()
        break
      case '-':
        e.preventDefault()
        setCountBuffer('')
        if (currentPath !== '/') {
          navigate({ 
            to: getParentPath(currentPath),
            search: { from: currentPath },
          })
        }
        break
    }
  }, [totalItems, handleNavigate, navigate, currentPath, mode, getCount, setCountBuffer])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="flex flex-col leading-[1.6]">
      {/* Current directory header */}
      <div className="font-bold" style={{ color: 'var(--blue)' }}>
        {currentPath === '/' ? '~/hobbescodes/' : `~/hobbescodes${currentPath}/`}
      </div>

      {/* Parent directory entry */}
      {hasParent && (
        <OilEntry
          entry={{ name: '..', displayName: '../', type: 'directory', path: getParentPath(currentPath) }}
          isSelected={selectedIndex === 0}
          isParent
          onClick={() => handleNavigate(0)}
        />
      )}

      {/* Regular entries */}
      {entries.map((entry, index) => {
        const adjustedIndex = hasParent ? index + 1 : index
        return (
          <OilEntry
            key={entry.path}
            entry={entry}
            isSelected={selectedIndex === adjustedIndex}
            onClick={() => handleNavigate(adjustedIndex)}
          />
        )
      })}
    </div>
  )
}

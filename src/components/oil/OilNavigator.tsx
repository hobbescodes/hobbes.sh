import { type FC, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { OilEntry } from './OilEntry'
import { NavigationHint } from '@/components/ui/NavigationHint'
import type { RouteEntry } from '@/types'
import { getParentPath } from '@/lib/routes'

interface OilNavigatorProps {
  entries: RouteEntry[]
  currentPath: string
  selectedIndex: number
  onSelectedIndexChange: (index: number) => void
  showParent?: boolean
}

export const OilNavigator: FC<OilNavigatorProps> = ({
  entries,
  currentPath,
  selectedIndex,
  onSelectedIndexChange,
  showParent = true,
}) => {
  const navigate = useNavigate()
  
  // Create the full list including parent directory if applicable
  const hasParent = showParent && currentPath !== '/'
  const totalItems = hasParent ? entries.length + 1 : entries.length

  const handleNavigate = useCallback(() => {
    if (hasParent && selectedIndex === 0) {
      // Navigate to parent
      navigate({ to: getParentPath(currentPath) })
    } else {
      const entryIndex = hasParent ? selectedIndex - 1 : selectedIndex
      const entry = entries[entryIndex]
      if (entry) {
        navigate({ to: entry.path })
      }
    }
  }, [selectedIndex, hasParent, entries, navigate, currentPath])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    switch (e.key) {
      case 'j':
      case 'ArrowDown':
        e.preventDefault()
        onSelectedIndexChange(Math.min(selectedIndex + 1, totalItems - 1))
        break
      case 'k':
      case 'ArrowUp':
        e.preventDefault()
        onSelectedIndexChange(Math.max(selectedIndex - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        handleNavigate()
        break
      case '-':
        e.preventDefault()
        if (currentPath !== '/') {
          navigate({ to: getParentPath(currentPath) })
        }
        break
      case 'g':
        // gg - go to top
        e.preventDefault()
        onSelectedIndexChange(0)
        break
      case 'G':
        // G - go to bottom
        e.preventDefault()
        onSelectedIndexChange(totalItems - 1)
        break
    }
  }, [selectedIndex, totalItems, onSelectedIndexChange, handleNavigate, navigate, currentPath])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Reset selection when entries change
  useEffect(() => {
    onSelectedIndexChange(0)
  }, [currentPath, onSelectedIndexChange])

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
          />
        )
      })}

          {/* Navigation hint */}
          <NavigationHint showNavigate showOpen showParent />
    </div>
  )
}

import { type FC, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { OilEntry } from './OilEntry'
import { useNavigation } from '@/context/NavigationContext'
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

  const { mode, getCount, setCountBuffer } = useNavigation()

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
          onSelectedIndexChange(Math.min(selectedIndex + count, totalItems - 1))
          setCountBuffer('') // Clear count after motion
        }
        break
      case 'k':
      case 'ArrowUp':
        e.preventDefault()
        {
          const count = getCount()
          onSelectedIndexChange(Math.max(selectedIndex - count, 0))
          setCountBuffer('') // Clear count after motion
        }
        break
      case 'Enter':
        e.preventDefault()
        setCountBuffer('') // Clear count on navigation
        handleNavigate()
        break
      case '-':
        e.preventDefault()
        setCountBuffer('') // Clear count on navigation
        if (currentPath !== '/') {
          navigate({ 
            to: getParentPath(currentPath),
            search: { from: currentPath },
          })
        }
        break
    }
  }, [selectedIndex, totalItems, onSelectedIndexChange, handleNavigate, navigate, currentPath, mode, getCount, setCountBuffer])

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

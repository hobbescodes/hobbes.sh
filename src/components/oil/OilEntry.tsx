import { type FC, type ReactNode } from 'react'
import type { RouteEntry } from '@/types'

interface OilEntryProps {
  entry: RouteEntry
  isSelected: boolean
  isParent?: boolean
  children?: ReactNode  // Allow additional content after the entry name
}

export const OilEntry: FC<OilEntryProps> = ({
  entry,
  isSelected,
  isParent = false,
  children,
}) => {
  const displayText = isParent ? '../' : entry.displayName
  const isDirectory = isParent || entry.type === 'directory'

  return (
    <div
      className="flex items-center leading-[1.6] relative"
      style={{ color: isSelected ? 'var(--text)' : 'var(--subtext1)' }}
    >
      {/* Block cursor for selected item */}
      {isSelected && (
        <span 
          className="absolute left-0 w-2"
          style={{ 
            backgroundColor: 'var(--cursor)',
            height: '1.2em',
            top: '50%', 
            transform: 'translateY(-50%)' 
          }}
        />
      )}
      
      {/* Content with padding for cursor */}
      <span className="pl-4">
        <span style={{ color: isDirectory ? 'var(--blue)' : undefined }}>
          {displayText}
        </span>
      </span>

      {/* Additional content (e.g., metadata) */}
      {children}
    </div>
  )
}

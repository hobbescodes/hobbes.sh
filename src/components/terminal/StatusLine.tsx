import { type FC } from 'react'
import type { NavigationMode } from '@/context/NavigationContext'

interface StatusLineProps {
  filepath: string
  filetype?: string
  encoding?: string
  mode: NavigationMode
  line?: number
  col?: number
}

const modeStyles: Record<string, { bg: string; text: string }> = {
  NORMAL: { bg: 'var(--blue)', text: 'var(--crust)' },
  INSERT: { bg: 'var(--green)', text: 'var(--crust)' },
  COMMAND: { bg: 'var(--peach)', text: 'var(--crust)' },
  SEARCH: { bg: 'var(--mauve)', text: 'var(--crust)' },
}

export const StatusLine: FC<StatusLineProps> = ({
  filepath,
  filetype = 'text',
  encoding = 'utf-8',
  mode,
  line = 1,
  col = 1,
}) => {
  const modeStyle = modeStyles[mode]

  return (
    <div 
      className="flex items-center h-6 text-xs select-none"
      style={{ 
        backgroundColor: 'var(--mantle)', 
        borderTop: '1px solid var(--surface0)' 
      }}
    >
      {/* Mode indicator */}
      <div 
        className="px-2 h-full flex items-center font-bold"
        style={{ 
          backgroundColor: modeStyle.bg, 
          color: modeStyle.text 
        }}
      >
        {mode}
      </div>

      {/* File path */}
      <div 
        className="px-3 truncate flex-1"
        style={{ color: 'var(--text)' }}
      >
        {filepath}
      </div>

      {/* Right side info */}
      <div 
        className="flex items-center gap-4 px-3"
        style={{ color: 'var(--subtext0)' }}
      >
        <span>[{filetype}]</span>
        <span>{encoding}</span>
        <span>{line}:{col}</span>
      </div>
    </div>
  )
}

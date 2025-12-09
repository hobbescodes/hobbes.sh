import { type FC, type ReactNode } from 'react'
import { TitleBar } from './TitleBar'
import { StatusLine } from './StatusLine'

interface TerminalProps {
  children: ReactNode
  title: string
  filepath: string
  filetype?: string
  mode?: 'NORMAL' | 'INSERT' | 'COMMAND' | 'SEARCH'
  line?: number
  col?: number
}

export const Terminal: FC<TerminalProps> = ({
  children,
  title,
  filepath,
  filetype = 'text',
  mode = 'NORMAL',
  line = 1,
  col = 1,
}) => {
  return (
    // Outer container - centers the terminal
    <div 
      className="min-h-screen w-screen flex items-center justify-center p-4 md:p-8"
      style={{ backgroundColor: 'var(--crust)' }}
    >
      {/* Terminal window */}
      <div 
        className="flex flex-col w-full max-w-4xl h-[80vh] rounded-lg overflow-hidden shadow-2xl"
        style={{ 
          backgroundColor: 'var(--background)',
          border: '1px solid var(--surface0)',
        }}
      >
        {/* macOS-style title bar */}
        <TitleBar title={title} />

        {/* Main content area */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>

        {/* Vim-style status line */}
        <StatusLine
          filepath={filepath}
          filetype={filetype}
          mode={mode}
          line={line}
          col={col}
        />
      </div>
    </div>
  )
}

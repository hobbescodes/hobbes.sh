import { CommandLine } from '@/components/editor'
import { HelpOverlay } from '@/components/ui/HelpOverlay'
import { SearchOverlay } from '@/components/ui/SearchOverlay'
import { useNavigation } from '@/context/NavigationContext'
import type { FC, ReactNode } from 'react'
import { StatusLine } from './StatusLine'
import { TitleBar } from './TitleBar'

interface TerminalProps {
  children: ReactNode
  title: string
  filepath: string
  filetype?: string
  line?: number
  col?: number
}

export const Terminal: FC<TerminalProps> = ({
  children,
  title,
  filepath,
  filetype = 'text',
  line = 1,
  col = 1,
}) => {
  const {
    mode,
    setMode,
    commandBuffer,
    commandError,
    searchQuery,
    searchResults,
    selectedSearchIndex,
    showHelp,
    setShowHelp,
  } = useNavigation()

  return (
    // Outer container - centers the terminal
    <div
      className="min-h-screen w-screen flex items-center justify-center p-4 md:p-8"
      style={{ backgroundColor: 'var(--crust)' }}
    >
      {/* Terminal window */}
      <div
        className="relative flex flex-col w-[50vw] min-w-[600px] h-[80vh] rounded-lg overflow-hidden shadow-2xl"
        style={{
          backgroundColor: 'var(--background)',
          border: '1px solid var(--surface0)',
        }}
      >
        {/* macOS-style title bar */}
        <TitleBar title={title} />

        {/* Main content area */}
        <div className="flex-1 overflow-hidden">{children}</div>

        {/* Command line (shown in COMMAND mode) */}
        {mode === 'COMMAND' && (
          <CommandLine buffer={commandBuffer} error={commandError} />
        )}

        {/* Vim-style status line */}
        <StatusLine
          filepath={filepath}
          filetype={filetype}
          mode={mode}
          line={line}
          col={col}
        />

        {/* Help overlay */}
        {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}

        {/* Search overlay */}
        {mode === 'SEARCH' && (
          <SearchOverlay
            query={searchQuery}
            results={searchResults}
            selectedIndex={selectedSearchIndex}
            onClose={() => setMode('NORMAL')}
          />
        )}
      </div>
    </div>
  )
}

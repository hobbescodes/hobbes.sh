import { type FC } from 'react'

interface CommandLineProps {
  buffer: string
  error: string | null
}

export const CommandLine: FC<CommandLineProps> = ({ buffer, error }) => {
  return (
    <div
      className="flex items-center h-6 px-2 text-sm font-mono"
      style={{
        backgroundColor: 'var(--surface0)',
        borderTop: '1px solid var(--surface1)',
      }}
    >
      {error ? (
        // Error state
        <span style={{ color: 'var(--red)' }}>{error}</span>
      ) : (
        // Normal input state
        <>
          <span style={{ color: 'var(--blue)' }}>:</span>
          <span style={{ color: 'var(--text)' }}>{buffer}</span>
          <span
            className="w-2 h-4 ml-0.5 animate-pulse"
            style={{ backgroundColor: 'var(--cursor)' }}
          />
        </>
      )}
    </div>
  )
}

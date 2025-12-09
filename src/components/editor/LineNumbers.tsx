import { type FC } from 'react'

interface LineNumbersProps {
  count: number
  currentLine?: number
  startLine?: number
}

export const LineNumbers: FC<LineNumbersProps> = ({
  count,
  currentLine = 1,
  startLine = 1,
}) => {
  // Calculate the width needed for line numbers
  const maxLineNumber = startLine + count - 1
  const width = Math.max(String(maxLineNumber).length, 3)

  return (
    <div 
      className="flex flex-col text-right select-none border-r border-[var(--surface0)]"
      style={{ 
        backgroundColor: 'var(--surface0)', 
        opacity: 0.3,
        minWidth: `${width + 3}ch`,
      }}
    >
      {Array.from({ length: count }, (_, i) => {
        const lineNumber = startLine + i
        const isCurrentLine = lineNumber === currentLine
        
        return (
          <div
            key={lineNumber}
            className="px-3 leading-[1.6]"
            style={{
              color: isCurrentLine ? 'var(--lavender)' : 'var(--overlay1)',
              fontWeight: isCurrentLine ? 'bold' : 'normal',
              backgroundColor: isCurrentLine ? 'var(--surface1)' : 'transparent',
            }}
          >
            {lineNumber}
          </div>
        )
      })}
    </div>
  )
}

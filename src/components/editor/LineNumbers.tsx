import { type FC } from 'react'

interface LineNumbersProps {
  count: number
  currentLine?: number
  startLine?: number
  relative?: boolean
  /** Number of lines with actual content. Lines beyond this show ~ */
  contentLineCount?: number
}

export const LineNumbers: FC<LineNumbersProps> = ({
  count,
  currentLine = 1,
  startLine = 1,
  relative = true,
  contentLineCount,
}) => {
  // Calculate the width needed for line numbers
  const maxLineNumber = startLine + count - 1
  const width = Math.max(String(maxLineNumber).length, 3)

  return (
    <div
      className="flex flex-col text-right select-none shrink-0"
      style={{
        minWidth: `${width + 3}ch`,
      }}
    >
      {Array.from({ length: count }, (_, i) => {
        const lineNumber = startLine + i
        const isCurrentLine = lineNumber === currentLine
        
        // Check if this line is beyond the content (empty line)
        const isEmptyLine = contentLineCount !== undefined && lineNumber > contentLineCount
        
        // Show ~ for empty lines, otherwise show line number
        const displayNumber = isEmptyLine
          ? '~'
          : relative
            ? isCurrentLine
              ? lineNumber
              : Math.abs(lineNumber - currentLine)
            : lineNumber

        return (
          <div
            key={lineNumber}
            className="px-3 leading-[1.6]"
            style={{
              color: isEmptyLine
                ? 'var(--surface2)'
                : isCurrentLine
                  ? 'var(--lavender)'
                  : 'var(--overlay0)',
              fontWeight: isCurrentLine && !isEmptyLine ? 'bold' : 'normal',
            }}
          >
            {displayNumber}
          </div>
        )
      })}
    </div>
  )
}

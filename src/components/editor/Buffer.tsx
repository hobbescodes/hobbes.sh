import { type FC, type ReactNode } from 'react'
import { LineNumbers } from './LineNumbers'

interface BufferProps {
  children: ReactNode
  lineCount?: number
  currentLine?: number
  showLineNumbers?: boolean
  startLine?: number
  className?: string
}

export const Buffer: FC<BufferProps> = ({
  children,
  lineCount,
  currentLine = 1,
  showLineNumbers = true,
  startLine = 1,
  className = '',
}) => {
  return (
    <div className={`flex h-full overflow-auto ${className}`}>
      {showLineNumbers && lineCount && (
        <LineNumbers
          count={lineCount}
          currentLine={currentLine}
          startLine={startLine}
        />
      )}
      <div className="flex-1 px-4 leading-[1.6]">
        {children}
      </div>
    </div>
  )
}

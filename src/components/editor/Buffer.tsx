import { type FC, type ReactNode, useRef, useEffect } from 'react'
import { LineNumbers } from './LineNumbers'

interface BufferProps {
  children: ReactNode
  lineCount?: number
  currentLine?: number
  showLineNumbers?: boolean
  startLine?: number
  className?: string
  /** Number of lines with actual content. Lines beyond this show ~ */
  contentLineCount?: number
}

export const Buffer: FC<BufferProps> = ({
  children,
  lineCount,
  currentLine = 1,
  showLineNumbers = true,
  startLine = 1,
  className = '',
  contentLineCount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to keep current line visible
  useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    // Approximate line height (1.6 * 14px base font = ~22.4px)
    const lineHeight = 22.4
    const targetScrollTop = (currentLine - 1) * lineHeight
    const containerHeight = container.clientHeight
    const currentScrollTop = container.scrollTop

    // Only scroll if the current line is outside the visible area
    // with some padding (2 lines top/bottom)
    const padding = lineHeight * 2
    const visibleTop = currentScrollTop + padding
    const visibleBottom = currentScrollTop + containerHeight - padding

    if (targetScrollTop < visibleTop) {
      // Scroll up to show the line
      container.scrollTo({
        top: Math.max(0, targetScrollTop - padding),
        behavior: 'smooth',
      })
    } else if (targetScrollTop > visibleBottom) {
      // Scroll down to show the line
      container.scrollTo({
        top: targetScrollTop - containerHeight + padding + lineHeight,
        behavior: 'smooth',
      })
    }
  }, [currentLine])

  return (
    <div ref={containerRef} className={`flex h-full overflow-auto ${className}`}>
      {showLineNumbers && lineCount && (
        <LineNumbers
          count={lineCount}
          currentLine={currentLine}
          startLine={startLine}
          contentLineCount={contentLineCount}
        />
      )}
      <div
        ref={contentRef}
        className="flex-1 px-4 py-0"
        style={{
          lineHeight: '1.6',
        }}
      >
        {children}
      </div>
    </div>
  )
}

import { useCallback, useEffect, useRef } from "react";

import { LineNumbers } from "@/components/editor/LineNumbers";

import type { FC, MouseEvent, ReactNode } from "react";

interface BufferProps {
  children: ReactNode;
  lineCount?: number;
  currentLine?: number;
  showLineNumbers?: boolean;
  startLine?: number;
  className?: string;
  /** Number of lines with actual content. Lines beyond this show ~ */
  contentLineCount?: number;
  /** Handler for clicking on a line (receives 1-indexed line number) */
  onLineClick?: (lineNumber: number) => void;
  /** Handler for clicking on a link line (receives 1-indexed line number) */
  onLinkClick?: (lineNumber: number) => void;
  /** Function to check if a line has a link (receives 0-indexed line number) */
  hasLinkAt?: (lineIndex: number) => boolean;
}

export const Buffer: FC<BufferProps> = ({
  children,
  lineCount,
  currentLine = 1,
  showLineNumbers = true,
  startLine = 1,
  className = "",
  contentLineCount,
  onLineClick,
  onLinkClick,
  hasLinkAt,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep current line visible
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    // Approximate line height (1.6 * 14px base font = ~22.4px)
    const lineHeight = 22.4;
    const targetScrollTop = (currentLine - 1) * lineHeight;
    const containerHeight = container.clientHeight;
    const currentScrollTop = container.scrollTop;

    // Only scroll if the current line is outside the visible area
    // with some padding (2 lines top/bottom)
    const padding = lineHeight * 2;
    const visibleTop = currentScrollTop + padding;
    const visibleBottom = currentScrollTop + containerHeight - padding;

    if (targetScrollTop < visibleTop) {
      // Scroll up to show the line
      container.scrollTo({
        top: Math.max(0, targetScrollTop - padding),
        behavior: "smooth",
      });
    } else if (targetScrollTop > visibleBottom) {
      // Scroll down to show the line
      container.scrollTo({
        top: targetScrollTop - containerHeight + padding + lineHeight,
        behavior: "smooth",
      });
    }
  }, [currentLine]);

  // Calculate which line was clicked based on mouse position
  const getClickedLine = useCallback(
    (e: MouseEvent<HTMLDivElement>): number | null => {
      if (!contentRef.current || !containerRef.current) return null;
      const rect = contentRef.current.getBoundingClientRect();
      const scrollTop = containerRef.current.scrollTop;
      const relativeY = e.clientY - rect.top + scrollTop;
      const lineHeight = 22.4; // matches the existing calculation (1.6 * 14px)
      const clickedLine = Math.floor(relativeY / lineHeight) + startLine;
      // Clamp to valid line range
      const maxLine = contentLineCount ?? lineCount ?? clickedLine;
      return Math.max(startLine, Math.min(clickedLine, maxLine));
    },
    [startLine, contentLineCount, lineCount],
  );

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const line = getClickedLine(e);
      if (line === null) return;

      // Always move cursor to clicked line
      if (onLineClick) {
        onLineClick(line);
      }

      // If clicking a line with a link, also trigger the link action
      // This makes links single-clickable on mobile
      const lineIndex = line - startLine;
      if (onLinkClick && hasLinkAt && hasLinkAt(lineIndex)) {
        onLinkClick(line);
      }
    },
    [onLineClick, onLinkClick, getClickedLine, hasLinkAt, startLine],
  );

  return (
    <div
      ref={containerRef}
      className={`flex h-full overflow-auto ${className}`}
    >
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
        className="flex-1 whitespace-nowrap px-4 py-0"
        style={{
          lineHeight: "1.6",
        }}
        onClick={handleClick}
      >
        {children}
      </div>
    </div>
  );
};

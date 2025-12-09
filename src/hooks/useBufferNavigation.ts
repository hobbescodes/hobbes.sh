import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigation } from "@/context/NavigationContext";
import { extractUrl } from "@/lib/utils";

interface UseBufferNavigationOptions {
  /** Array of content lines */
  content: string[];
  /** Initial line number (1-indexed, default: 1) */
  initialLine?: number;
  /** Handler for navigating back (- key) */
  onNavigateBack: () => void;
}

interface LineProps {
  /** Whether this line is currently selected */
  isSelected: boolean;
  /** Whether this line contains a URL */
  hasLink: boolean;
  /** The URL on this line, if any */
  url: string | null;
}

interface UseBufferNavigationReturn {
  /** Current line number (1-indexed) */
  currentLine: number;
  /** Set current line (1-indexed) */
  setCurrentLine: (line: number) => void;
  /** Whether the current line has a link */
  currentLineHasLink: boolean;
  /** Get props for a specific line (0-indexed) */
  getLineProps: (lineIndex: number) => LineProps;
}

/**
 * Hook for vim-style buffer navigation with j/k keys,
 * gx to open links, and Enter to open links on the current line.
 */
export function useBufferNavigation({
  content,
  initialLine = 1,
  onNavigateBack,
}: UseBufferNavigationOptions): UseBufferNavigationReturn {
  const { mode, getCount, setCountBuffer } = useNavigation();
  const [currentLineRaw, setCurrentLineRaw] = useState(initialLine);

  const totalLines = content.length;

  // Derive clamped current line - always valid even if content shrinks
  const currentLine = Math.max(1, Math.min(currentLineRaw, totalLines));

  // Setter that clamps the value
  const setCurrentLine = useCallback(
    (line: number | ((prev: number) => number)) => {
      setCurrentLineRaw((prev) => {
        const newValue = typeof line === "function" ? line(prev) : line;
        return Math.max(1, Math.min(newValue, totalLines));
      });
    },
    [totalLines],
  );

  // Pre-compute which lines have links
  const lineUrls = useMemo(() => {
    return content.map((line) => extractUrl(line));
  }, [content]);

  // Get URL for current line (0-indexed internally, 1-indexed externally)
  const currentLineUrl = lineUrls[currentLine - 1] ?? null;
  const currentLineHasLink = currentLineUrl !== null;

  // Get props for a specific line
  const getLineProps = useCallback(
    (lineIndex: number): LineProps => {
      const url = lineUrls[lineIndex] ?? null;
      return {
        isSelected: lineIndex === currentLine - 1,
        hasLink: url !== null,
        url,
      };
    },
    [currentLine, lineUrls],
  );

  // Open URL in new tab
  const openUrl = useCallback((url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle if in input or not in NORMAL mode
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        mode !== "NORMAL"
      ) {
        return;
      }

      switch (e.key) {
        case "j":
        case "ArrowDown": {
          e.preventDefault();
          const count = getCount();
          setCurrentLine((prev) => prev + count);
          setCountBuffer("");
          break;
        }
        case "k":
        case "ArrowUp": {
          e.preventDefault();
          const count = getCount();
          setCurrentLine((prev) => prev - count);
          setCountBuffer("");
          break;
        }
        case "Enter": {
          // Open link if current line has one
          if (currentLineUrl) {
            e.preventDefault();
            openUrl(currentLineUrl);
          }
          break;
        }
        case "-": {
          e.preventDefault();
          onNavigateBack();
          break;
        }
      }
    },
    [
      mode,
      getCount,
      setCountBuffer,
      setCurrentLine,
      currentLineUrl,
      openUrl,
      onNavigateBack,
    ],
  );

  // Listen for gx-execute event from NavigationContext
  const handleGxExecute = useCallback(() => {
    if (currentLineUrl) {
      openUrl(currentLineUrl);
    }
  }, [currentLineUrl, openUrl]);

  // Listen for scroll-half-page event from NavigationContext (Ctrl+d/u)
  const handleScrollHalfPage = useCallback(
    (e: Event) => {
      const { direction, lines } = (
        e as CustomEvent<{ direction: "down" | "up"; lines: number }>
      ).detail;
      // Add 1 extra line to account for title bar clipping
      if (direction === "down") {
        setCurrentLine((prev) => prev + lines + 1);
      } else {
        setCurrentLine((prev) => prev - lines - 1);
      }
    },
    [setCurrentLine],
  );

  // Set up event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("gx-execute", handleGxExecute);
    window.addEventListener("scroll-half-page", handleScrollHalfPage);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("gx-execute", handleGxExecute);
      window.removeEventListener("scroll-half-page", handleScrollHalfPage);
    };
  }, [handleKeyDown, handleGxExecute, handleScrollHalfPage]);

  return {
    currentLine,
    setCurrentLine,
    currentLineHasLink,
    getLineProps,
  };
}

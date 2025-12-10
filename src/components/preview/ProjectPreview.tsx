import { useEffect, useMemo, useRef, useState } from "react";

import { useNavigation } from "@/context/NavigationContext";
import { usePane } from "@/context/PaneContext";

import type { FC } from "react";
import type { ProjectWithReadme } from "@/types";

interface ProjectPreviewProps {
  project: ProjectWithReadme;
}

/** Line height in pixels (matches leading-[1.6] with 14px base font) */
const LINE_HEIGHT = 22.4;

/**
 * Get the color for a markdown line based on its content
 */
function getLineColor(line: string): string | undefined {
  if (line.startsWith("# ")) return "var(--red)";
  if (line.startsWith("## ")) return "var(--peach)";
  if (line.startsWith("### ")) return "var(--yellow)";
  if (line.startsWith("#### ")) return "var(--green)";
  if (line.startsWith("- ") || line.startsWith("* ")) return "var(--teal)";
  if (line.startsWith("> ")) return "var(--subtext0)";
  if (line.startsWith("```")) return "var(--overlay2)";
  if (line.match(/^\d+\. /)) return "var(--teal)";
  if (line.includes("https://") || line.includes("http://"))
    return "var(--blue)";
  return undefined;
}

/**
 * Check if a line should be bold
 */
function isLineBold(line: string): boolean {
  return line.startsWith("#");
}

/**
 * ProjectPreview - Preview pane content for project pages
 *
 * Renders the project's README.md content as raw markdown text
 * with syntax highlighting and vim-style line navigation.
 */
export const ProjectPreview: FC<ProjectPreviewProps> = ({ project }) => {
  const { previewUrl, activePane } = usePane();
  const { mode, getCount, setCountBuffer } = useNavigation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Current line (1-indexed, like vim)
  const [currentLine, setCurrentLine] = useState(1);

  // Split markdown into lines
  const lines = useMemo(() => {
    if (!project.readme) return [];
    return project.readme.split("\n");
  }, [project.readme]);

  const totalLines = lines.length;

  // Calculate the width needed for line numbers
  const lineNumberWidth = useMemo(() => {
    return Math.max(String(totalLines).length, 3);
  }, [totalLines]);

  // Auto-scroll to keep current line visible
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const targetScrollTop = (currentLine - 1) * LINE_HEIGHT;
    const containerHeight = container.clientHeight;
    const currentScrollTop = container.scrollTop;

    // Only scroll if the current line is outside the visible area
    // with some padding (2 lines top/bottom)
    const padding = LINE_HEIGHT * 2;
    const visibleTop = currentScrollTop + padding;
    const visibleBottom = currentScrollTop + containerHeight - padding;

    if (targetScrollTop < visibleTop) {
      container.scrollTo({
        top: Math.max(0, targetScrollTop - padding),
        behavior: "smooth",
      });
    } else if (targetScrollTop > visibleBottom) {
      container.scrollTo({
        top: targetScrollTop - containerHeight + padding + LINE_HEIGHT,
        behavior: "smooth",
      });
    }
  }, [currentLine]);

  // Handle j/k keyboard navigation when right pane is active
  useEffect(() => {
    if (activePane !== "right") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is in an input field or not in NORMAL mode
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
          setCurrentLine((prev) => Math.min(prev + count, totalLines));
          setCountBuffer("");
          break;
        }
        case "k":
        case "ArrowUp": {
          e.preventDefault();
          const count = getCount();
          setCurrentLine((prev) => Math.max(prev - count, 1));
          setCountBuffer("");
          break;
        }
        case "g":
          // g goes to top
          e.preventDefault();
          setCurrentLine(1);
          break;
        case "G":
          // G goes to bottom
          e.preventDefault();
          setCurrentLine(totalLines);
          break;
        case "d":
          // Ctrl+d for half page down
          if (e.ctrlKey) {
            e.preventDefault();
            const halfPage = Math.floor(
              (scrollContainerRef.current?.clientHeight ?? 0) / LINE_HEIGHT / 2,
            );
            setCurrentLine((prev) => Math.min(prev + halfPage, totalLines));
          }
          break;
        case "u":
          // Ctrl+u for half page up
          if (e.ctrlKey) {
            e.preventDefault();
            const halfPage = Math.floor(
              (scrollContainerRef.current?.clientHeight ?? 0) / LINE_HEIGHT / 2,
            );
            setCurrentLine((prev) => Math.max(prev - halfPage, 1));
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePane, totalLines, mode, getCount, setCountBuffer]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Preview header */}
      <div
        className="px-4 py-2"
        style={{
          backgroundColor: "var(--mantle)",
          borderBottom: "1px solid var(--surface0)",
        }}
      >
        <span className="font-bold text-sm" style={{ color: "var(--blue)" }}>
          README.md
        </span>
      </div>

      {/* README content with line numbers - single scrollable container */}
      <div ref={scrollContainerRef} className="flex flex-1 overflow-auto">
        {/* Line numbers gutter - matches LineNumbers component styling */}
        {lines.length > 0 && (
          <div
            className="shrink-0 select-none text-right"
            style={{
              minWidth: `${lineNumberWidth + 3}ch`,
            }}
          >
            {lines.map((_, i) => {
              const lineNumber = i + 1;
              const isCurrentLine = lineNumber === currentLine;
              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: line numbers are static based on content
                  key={i}
                  className="px-3 leading-[1.6]"
                  style={{
                    color: isCurrentLine
                      ? "var(--lavender)"
                      : "var(--overlay0)",
                    fontWeight: isCurrentLine ? "bold" : "normal",
                  }}
                >
                  {lineNumber}
                </div>
              );
            })}
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 px-4" style={{ color: "var(--text)" }}>
          {lines.length > 0 ? (
            lines.map((line, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: content lines are static based on readme
                key={i}
                className="leading-[1.6]"
                style={{
                  color: getLineColor(line),
                  fontWeight: isLineBold(line) ? "bold" : undefined,
                }}
              >
                {line || "\u00A0"}
              </div>
            ))
          ) : (
            <div
              className="flex h-full items-center justify-center"
              style={{ color: "var(--overlay0)" }}
            >
              No README available
            </div>
          )}
        </div>
      </div>

      {/* Footer with project link and keyboard hints */}
      <div
        className="flex items-center justify-between border-t px-4 py-2"
        style={{
          backgroundColor: "var(--mantle)",
          borderColor: "var(--surface0)",
        }}
      >
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-xs underline decoration-dotted underline-offset-2 hover:decoration-solid"
            style={{ color: "var(--blue)" }}
          >
            {previewUrl}
          </a>
        )}
        <div
          className="flex items-center gap-3 text-xs"
          style={{ color: "var(--overlay0)" }}
        >
          <span>
            <KeyHint>j/k</KeyHint> scroll
          </span>
          <span>
            <KeyHint>^a h</KeyHint> left
          </span>
          <span>
            <KeyHint>^a x</KeyHint> close
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper component for keyboard hint styling
const KeyHint: FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    className="rounded px-1 py-0.5 font-mono"
    style={{
      backgroundColor: "var(--surface1)",
      color: "var(--blue)",
    }}
  >
    {children}
  </span>
);

import { useCallback, useEffect, useMemo, useState } from "react";

import { useHistory } from "@/context/HistoryContext";
import { formatRelativeTime } from "@/lib/utils";

import type { FC } from "react";
import type { HistoryEntry } from "@/context/HistoryContext";

interface HistoryOverlayProps {
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const HistoryOverlay: FC<HistoryOverlayProps> = ({
  onClose,
  onNavigate,
}) => {
  const { entries, currentIndex, setIsJumplistNavigation } = useHistory();

  // Reverse entries so most recent is at bottom (telescope-style)
  // and show oldest at top
  const displayEntries = useMemo(() => {
    return [...entries].reverse();
  }, [entries]);

  // Selected index (0 = most recent, which is at bottom of reversed list)
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter query for filtering history
  const [filterQuery, setFilterQuery] = useState("");

  // Filtered entries based on query
  const filteredEntries = useMemo(() => {
    if (!filterQuery.trim()) {
      return displayEntries;
    }
    const query = filterQuery.toLowerCase();
    return displayEntries.filter(
      (entry) =>
        entry.displayName.toLowerCase().includes(query) ||
        entry.path.toLowerCase().includes(query),
    );
  }, [displayEntries, filterQuery]);

  // Keep selected index in bounds
  const clampedIndex = Math.min(
    selectedIndex,
    Math.max(0, filteredEntries.length - 1),
  );

  const handleSelect = useCallback(
    (entry: HistoryEntry) => {
      setIsJumplistNavigation(true);
      onNavigate(entry.path);
      onClose();
    },
    [onNavigate, onClose, setIsJumplistNavigation],
  );

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          e.stopPropagation();
          // In reversed list, "down" visually moves up the list (lower index)
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          e.stopPropagation();
          // In reversed list, "up" visually moves down the list (higher index)
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredEntries.length - 1),
          );
          break;
        case "Enter":
          e.preventDefault();
          e.stopPropagation();
          if (filteredEntries.length > 0) {
            handleSelect(
              filteredEntries[filteredEntries.length - 1 - clampedIndex],
            );
          }
          break;
        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          onClose();
          break;
        case "Backspace":
          e.preventDefault();
          e.stopPropagation();
          setFilterQuery((prev) => prev.slice(0, -1));
          setSelectedIndex(0); // Reset selection on filter change
          break;
        default:
          // Type to filter
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            e.stopPropagation();
            setFilterQuery((prev) => prev + e.key);
            setSelectedIndex(0); // Reset selection on filter change
          } else {
            e.stopPropagation();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [filteredEntries, clampedIndex, handleSelect, onClose]);

  // Calculate which entry is current in jumplist
  const currentJumplistPath =
    currentIndex !== -1 && entries[currentIndex]
      ? entries[currentIndex].path
      : null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(17, 17, 27, 0.85)" }}
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-lg"
        style={{
          backgroundColor: "var(--base)",
          border: "1px solid var(--surface0)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          maxHeight: "70vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-4 py-3 text-center font-bold"
          style={{
            backgroundColor: "var(--surface0)",
            color: "var(--text)",
            borderBottom: "1px solid var(--surface1)",
          }}
        >
          Recent Files
        </div>

        {/* Results count */}
        <div
          className="px-4 py-1 text-xs"
          style={{
            color: "var(--overlay1)",
            borderBottom: "1px solid var(--surface0)",
          }}
        >
          Results ({filteredEntries.length})
        </div>

        {/* History list */}
        <div
          className="flex-1 overflow-y-auto p-2"
          style={{ minHeight: "200px", maxHeight: "400px" }}
        >
          {filteredEntries.length === 0 ? (
            <div
              className="px-3 py-4 text-center text-sm"
              style={{ color: "var(--overlay1)" }}
            >
              {entries.length === 0 ? "No history yet" : "No matches"}
            </div>
          ) : (
            // Display in reverse order (most recent at bottom, telescope-style)
            filteredEntries.map((entry, idx) => {
              // In the reversed list, selectedIndex 0 = bottom item
              const isSelected =
                idx === filteredEntries.length - 1 - clampedIndex;
              const isCurrentJumplist = entry.path === currentJumplistPath;

              return (
                <button
                  key={`${entry.path}-${entry.timestamp}`}
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-3 rounded px-3 py-1.5 text-left text-sm transition-colors"
                  style={{
                    backgroundColor: isSelected
                      ? "var(--surface1)"
                      : "transparent",
                    color: isSelected ? "var(--text)" : "var(--subtext0)",
                  }}
                  onClick={() => handleSelect(entry)}
                  onMouseEnter={() =>
                    setSelectedIndex(filteredEntries.length - 1 - idx)
                  }
                >
                  {/* Selection indicator */}
                  <span
                    className="w-4 font-bold"
                    style={{
                      color: isSelected ? "var(--blue)" : "transparent",
                    }}
                  >
                    {">"}
                  </span>

                  {/* Jumplist position indicator */}
                  <span
                    className="w-4 text-center text-xs"
                    style={{ color: "var(--yellow)" }}
                  >
                    {isCurrentJumplist ? "*" : ""}
                  </span>

                  {/* File name */}
                  <span
                    className="flex-1 truncate font-mono"
                    style={{
                      color: isSelected ? "var(--text)" : "var(--subtext0)",
                    }}
                  >
                    {entry.displayName}
                  </span>

                  {/* Relative time */}
                  <span
                    className="whitespace-nowrap text-xs"
                    style={{ color: "var(--overlay1)" }}
                  >
                    {formatRelativeTime(entry.timestamp)}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Filter input */}
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{
            backgroundColor: "var(--surface0)",
            borderTop: "1px solid var(--surface1)",
          }}
        >
          <span style={{ color: "var(--blue)" }}>&gt;</span>
          <span className="font-mono text-sm" style={{ color: "var(--text)" }}>
            {filterQuery}
            <span
              className="inline-block h-4 w-2 animate-pulse"
              style={{ backgroundColor: "var(--cursor)" }}
            />
          </span>
        </div>

        {/* Footer hints */}
        <div
          className="flex items-center justify-center gap-6 px-4 py-2 text-xs"
          style={{
            backgroundColor: "var(--surface0)",
            color: "var(--overlay1)",
            borderTop: "1px solid var(--surface1)",
          }}
        >
          <span>
            <KeyHint>j/k</KeyHint> navigate
          </span>
          <span>
            <KeyHint>Enter</KeyHint> open
          </span>
          <span>
            <KeyHint>Esc</KeyHint> close
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper component for key hints
const KeyHint: FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    className="rounded px-1.5 py-0.5 font-mono text-xs"
    style={{
      backgroundColor: "var(--surface1)",
      color: "var(--blue)",
    }}
  >
    {children}
  </span>
);

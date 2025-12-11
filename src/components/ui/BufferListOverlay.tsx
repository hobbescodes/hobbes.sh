import { useCallback, useEffect, useMemo, useState } from "react";

import { useBuffers } from "@/context/BufferContext";

import type { FC } from "react";
import type { Buffer } from "@/context/BufferContext";

interface BufferListOverlayProps {
  onClose: () => void;
}

export const BufferListOverlay: FC<BufferListOverlayProps> = ({ onClose }) => {
  const {
    buffers,
    currentBufferId,
    alternateBufferId,
    switchToBuffer,
    removeBuffer,
  } = useBuffers();

  // Selected index (0 = first buffer at top)
  const [selectedIndex, setSelectedIndex] = useState(() => {
    // Start with current buffer selected
    const currentIndex = buffers.findIndex((b) => b.id === currentBufferId);
    return currentIndex >= 0 ? currentIndex : 0;
  });

  // Filter query
  const [filterQuery, setFilterQuery] = useState("");

  // Filtered buffers based on query
  const filteredBuffers = useMemo(() => {
    if (!filterQuery.trim()) {
      return buffers;
    }
    const query = filterQuery.toLowerCase();
    return buffers.filter(
      (buffer) =>
        buffer.displayName.toLowerCase().includes(query) ||
        buffer.path.toLowerCase().includes(query),
    );
  }, [buffers, filterQuery]);

  // Keep selected index in bounds
  const clampedIndex = Math.min(
    selectedIndex,
    Math.max(0, filteredBuffers.length - 1),
  );

  const handleSelect = useCallback(
    (buffer: Buffer) => {
      switchToBuffer(buffer.id);
      onClose();
    },
    [switchToBuffer, onClose],
  );

  const handleDelete = useCallback(
    (buffer: Buffer) => {
      removeBuffer(buffer.id);
      // If we deleted the last item, adjust selection
      if (clampedIndex >= filteredBuffers.length - 1 && clampedIndex > 0) {
        setSelectedIndex(clampedIndex - 1);
      }
    },
    [removeBuffer, clampedIndex, filteredBuffers.length],
  );

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredBuffers.length - 1),
          );
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          e.stopPropagation();
          if (filteredBuffers.length > 0) {
            handleSelect(filteredBuffers[clampedIndex]);
          }
          break;
        case "d":
          // Delete selected buffer (vim-style)
          e.preventDefault();
          e.stopPropagation();
          if (filteredBuffers.length > 0) {
            handleDelete(filteredBuffers[clampedIndex]);
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
  }, [filteredBuffers, clampedIndex, handleSelect, handleDelete, onClose]);

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
          Buffers
        </div>

        {/* Results count */}
        <div
          className="px-4 py-1 text-xs"
          style={{
            color: "var(--overlay1)",
            borderBottom: "1px solid var(--surface0)",
          }}
        >
          {filteredBuffers.length} buffer{filteredBuffers.length !== 1 && "s"}
        </div>

        {/* Buffer list */}
        <div
          className="flex-1 overflow-y-auto p-2"
          style={{ minHeight: "150px", maxHeight: "400px" }}
        >
          {filteredBuffers.length === 0 ? (
            <div
              className="px-3 py-4 text-center text-sm"
              style={{ color: "var(--overlay1)" }}
            >
              {buffers.length === 0 ? "No buffers open" : "No matches"}
            </div>
          ) : (
            filteredBuffers.map((buffer, idx) => {
              const isSelected = idx === clampedIndex;
              const isCurrent = buffer.id === currentBufferId;
              const isAlternate = buffer.id === alternateBufferId && !isCurrent;
              const displayNumber =
                buffers.findIndex((b) => b.id === buffer.id) + 1;

              return (
                <button
                  key={buffer.id}
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 rounded px-3 py-1.5 text-left text-sm transition-colors"
                  style={{
                    backgroundColor: isSelected
                      ? "var(--surface1)"
                      : "transparent",
                    color: isSelected ? "var(--text)" : "var(--subtext0)",
                  }}
                  onClick={() => handleSelect(buffer)}
                  onMouseEnter={() => setSelectedIndex(idx)}
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

                  {/* Buffer number */}
                  <span
                    className="w-6 text-right font-mono"
                    style={{ color: "var(--overlay0)" }}
                  >
                    {displayNumber}
                  </span>

                  {/* Status indicator */}
                  <span
                    className="w-6 text-center font-mono text-xs"
                    style={{
                      color: isCurrent
                        ? "var(--green)"
                        : isAlternate
                          ? "var(--yellow)"
                          : "transparent",
                    }}
                  >
                    {isCurrent ? "%a" : isAlternate ? "#" : ""}
                  </span>

                  {/* File name */}
                  <span
                    className="flex-1 truncate font-mono"
                    style={{
                      color: isSelected ? "var(--text)" : "var(--subtext0)",
                    }}
                  >
                    {buffer.displayName}
                  </span>

                  {/* Path */}
                  <span
                    className="truncate text-xs"
                    style={{ color: "var(--overlay1)" }}
                  >
                    ~{buffer.path}
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
            <KeyHint>d</KeyHint> delete
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

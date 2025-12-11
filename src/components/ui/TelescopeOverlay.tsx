import { useCallback, useEffect, useMemo, useState } from "react";

import { useBuffers } from "@/context/BufferContext";
import { useHistory } from "@/context/HistoryContext";
import { useMarks } from "@/context/MarksContext";
import { getAllRoutes } from "@/lib/routes";
import {
  COLORSCHEME_META,
  COMMANDS,
  HELP_TAGS,
  TELESCOPE_TITLES,
  filterTelescopeItems,
} from "@/lib/telescope";

import type { FC, ReactNode } from "react";
import type { TelescopeItem, TelescopeMode } from "@/lib/telescope";
import type { Colorscheme } from "@/types";

interface TelescopeOverlayProps {
  mode: TelescopeMode;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onSwitchBuffer: (id: number) => void;
  onSetColorscheme: (colorscheme: Colorscheme) => void;
}

export const TelescopeOverlay: FC<TelescopeOverlayProps> = ({
  mode,
  onClose,
  onNavigate,
  onSwitchBuffer,
  onSetColorscheme,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { marks } = useMarks();
  const { buffers, currentBufferId, alternateBufferId } = useBuffers();
  const { entries } = useHistory();

  // Get items based on mode
  const items = useMemo((): TelescopeItem[] => {
    let result: TelescopeItem[] = [];

    switch (mode) {
      case "find_files":
        result = getAllRoutes().map((route) => ({
          id: route.path,
          displayName: route.displayName,
          description: route.description || route.title || route.path,
          metadata: { type: route.type, path: route.path },
        }));
        break;

      case "buffers":
        result = buffers.map((buf, i) => {
          const isCurrent = buf.id === currentBufferId;
          const isAlternate = buf.id === alternateBufferId && !isCurrent;
          return {
            id: String(buf.id),
            displayName: buf.displayName,
            description: buf.path,
            icon: isCurrent ? "%a" : isAlternate ? "#" : undefined,
            metadata: { number: i + 1, bufferId: buf.id, path: buf.path },
          };
        });
        break;

      case "marks":
        result = Object.entries(marks)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, mark]) => ({
            id: key,
            displayName: `'${key}`,
            description: mark.displayName,
            metadata: { path: mark.path, createdAt: mark.createdAt },
          }));
        break;

      case "commands":
        result = COMMANDS;
        break;

      case "help_tags":
        result = HELP_TAGS;
        break;

      case "recent":
        result = entries.map((entry) => ({
          id: `${entry.path}-${entry.timestamp}`,
          displayName: entry.displayName,
          description: formatRelativeTime(entry.timestamp),
          metadata: { path: entry.path, timestamp: entry.timestamp },
        }));
        break;

      case "colorscheme":
        result = Object.entries(COLORSCHEME_META).map(([id, meta]) => ({
          id,
          displayName: meta.label,
          description: meta.description,
          icon: meta.type === "light" ? "☀" : "☾",
          metadata: { type: meta.type },
        }));
        break;
    }

    return filterTelescopeItems(result, query);
  }, [
    mode,
    query,
    marks,
    buffers,
    currentBufferId,
    alternateBufferId,
    entries,
  ]);

  // Keep selected index in bounds
  const clampedIndex = Math.min(selectedIndex, Math.max(0, items.length - 1));

  // Handle selection
  const handleSelect = useCallback(
    (item: TelescopeItem) => {
      switch (mode) {
        case "find_files":
        case "recent":
          onNavigate(item.metadata?.path as string);
          break;

        case "buffers":
          onSwitchBuffer(item.metadata?.bufferId as number);
          break;

        case "marks":
          onNavigate(item.metadata?.path as string);
          break;

        case "commands":
          // For commands, we just close - user can type the command
          // Could enhance to actually execute, but that adds complexity
          break;

        case "help_tags":
          // Could scroll to section in future
          break;

        case "colorscheme":
          onSetColorscheme(item.id as Colorscheme);
          break;
      }
      onClose();
    },
    [mode, onClose, onNavigate, onSwitchBuffer, onSetColorscheme],
  );

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
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
          if (items.length > 0 && items[clampedIndex]) {
            handleSelect(items[clampedIndex]);
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
          setQuery((prev) => prev.slice(0, -1));
          setSelectedIndex(0);
          break;
        default:
          // Type to filter
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            e.stopPropagation();
            setQuery((prev) => prev + e.key);
            setSelectedIndex(0);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [items, clampedIndex, handleSelect, onClose]);

  const selectedItem = items[clampedIndex];

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(17, 17, 27, 0.85)" }}
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-4xl flex-col overflow-hidden rounded-lg"
        style={{
          backgroundColor: "var(--base)",
          border: "1px solid var(--surface0)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          maxHeight: "70vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Key hints */}
        <div
          className="flex items-center justify-center gap-6 px-4 py-2 text-xs"
          style={{
            backgroundColor: "var(--mantle)",
            color: "var(--overlay1)",
            borderBottom: "1px solid var(--surface0)",
          }}
        >
          <span>
            <KeyHint>↑↓</KeyHint> navigate
          </span>
          <span>
            <KeyHint>Enter</KeyHint> select
          </span>
          <span>
            <KeyHint>Esc</KeyHint> close
          </span>
        </div>

        {/* Title */}
        <div
          className="px-4 py-2 text-center font-bold"
          style={{
            backgroundColor: "var(--surface0)",
            color: "var(--text)",
            borderBottom: "1px solid var(--surface1)",
          }}
        >
          {TELESCOPE_TITLES[mode]}
        </div>

        {/* Split pane content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Results */}
          <div
            className="w-1/2 overflow-y-auto border-r p-2"
            style={{
              borderColor: "var(--surface0)",
              minHeight: "200px",
              maxHeight: "400px",
            }}
          >
            <div className="mb-2 text-xs" style={{ color: "var(--overlay1)" }}>
              Results ({items.length})
            </div>

            {items.length === 0 ? (
              <div
                className="py-4 text-center text-sm"
                style={{ color: "var(--overlay0)" }}
              >
                No results
              </div>
            ) : (
              <div className="space-y-0.5">
                {items.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1 text-left text-sm transition-colors"
                    style={{
                      backgroundColor:
                        idx === clampedIndex
                          ? "var(--surface1)"
                          : "transparent",
                      color:
                        idx === clampedIndex
                          ? "var(--text)"
                          : "var(--subtext0)",
                    }}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    {/* Selection indicator */}
                    <span
                      style={{
                        color:
                          idx === clampedIndex ? "var(--blue)" : "transparent",
                      }}
                    >
                      {">"}
                    </span>

                    {/* Icon if present */}
                    {item.icon && (
                      <span
                        className="text-xs"
                        style={{
                          color:
                            item.icon === "%a"
                              ? "var(--green)"
                              : item.icon === "#"
                                ? "var(--yellow)"
                                : "var(--overlay1)",
                        }}
                      >
                        {item.icon}
                      </span>
                    )}

                    {/* Display name */}
                    <span className="truncate font-mono">
                      {item.displayName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div
            className="w-1/2 overflow-y-auto p-4"
            style={{ minHeight: "200px", maxHeight: "400px" }}
          >
            {selectedItem ? (
              <PreviewPane item={selectedItem} mode={mode} />
            ) : (
              <div
                className="flex h-full items-center justify-center text-sm"
                style={{ color: "var(--overlay0)" }}
              >
                No selection
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{
            backgroundColor: "var(--surface0)",
            borderTop: "1px solid var(--surface1)",
          }}
        >
          <span style={{ color: "var(--blue)" }}>&gt;</span>
          <span className="font-mono text-sm" style={{ color: "var(--text)" }}>
            {query}
            <span
              className="inline-block h-4 w-2 animate-pulse"
              style={{ backgroundColor: "var(--cursor)" }}
            />
          </span>
        </div>
      </div>
    </div>
  );
};

// Preview pane component
interface PreviewPaneProps {
  item: TelescopeItem;
  mode: TelescopeMode;
}

const PreviewPane: FC<PreviewPaneProps> = ({ item, mode }) => {
  return (
    <div className="space-y-3">
      {/* Title */}
      <div className="font-bold text-lg" style={{ color: "var(--blue)" }}>
        {item.displayName}
      </div>

      {/* Description */}
      {item.description && (
        <div style={{ color: "var(--subtext0)" }}>{item.description}</div>
      )}

      {/* Mode-specific content */}
      {mode === "find_files" && item.metadata && (
        <div className="space-y-1 text-sm">
          <div style={{ color: "var(--overlay1)" }}>
            Type:{" "}
            <span style={{ color: "var(--peach)" }}>
              {item.metadata.type as string}
            </span>
          </div>
          <div style={{ color: "var(--overlay1)" }}>
            Path:{" "}
            <span className="font-mono" style={{ color: "var(--green)" }}>
              {item.metadata.path as string}
            </span>
          </div>
        </div>
      )}

      {mode === "buffers" && item.metadata && (
        <div className="space-y-1 text-sm">
          <div style={{ color: "var(--overlay1)" }}>
            Buffer #{item.metadata.number as number}
          </div>
          <div style={{ color: "var(--overlay1)" }}>
            Path:{" "}
            <span className="font-mono" style={{ color: "var(--green)" }}>
              {item.metadata.path as string}
            </span>
          </div>
        </div>
      )}

      {mode === "marks" && item.metadata && (
        <div className="space-y-1 text-sm">
          <div style={{ color: "var(--overlay1)" }}>
            Path:{" "}
            <span className="font-mono" style={{ color: "var(--green)" }}>
              {item.metadata.path as string}
            </span>
          </div>
          {typeof item.metadata.createdAt === "number" && (
            <div style={{ color: "var(--overlay1)" }}>
              Set:{" "}
              <span style={{ color: "var(--peach)" }}>
                {formatRelativeTime(item.metadata.createdAt)}
              </span>
            </div>
          )}
        </div>
      )}

      {mode === "commands" && (
        <div className="space-y-2 text-sm">
          <div
            className="rounded p-2 font-mono"
            style={{
              backgroundColor: "var(--surface0)",
              color: "var(--green)",
            }}
          >
            {item.displayName}
          </div>
          <div style={{ color: "var(--overlay1)" }}>
            Press <KeyHint>:</KeyHint> then type this command
          </div>
        </div>
      )}

      {mode === "help_tags" && (
        <div className="text-sm" style={{ color: "var(--overlay1)" }}>
          Press <KeyHint>?</KeyHint> to open full help
        </div>
      )}

      {mode === "recent" && item.metadata && (
        <div className="space-y-1 text-sm">
          <div style={{ color: "var(--overlay1)" }}>
            Path:{" "}
            <span className="font-mono" style={{ color: "var(--green)" }}>
              {item.metadata.path as string}
            </span>
          </div>
        </div>
      )}

      {mode === "colorscheme" && item.metadata && (
        <div className="space-y-2 text-sm">
          <div style={{ color: "var(--overlay1)" }}>
            Type:{" "}
            <span
              style={{
                color:
                  item.metadata.type === "dark"
                    ? "var(--blue)"
                    : "var(--yellow)",
              }}
            >
              {item.metadata.type as string}
            </span>
          </div>
          <div
            className="flex gap-1 rounded p-2"
            style={{ backgroundColor: "var(--surface0)" }}
          >
            {/* Color preview squares - these would ideally show actual theme colors */}
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: "var(--red)" }}
            />
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: "var(--green)" }}
            />
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: "var(--blue)" }}
            />
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: "var(--yellow)" }}
            />
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: "var(--mauve)" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for key hints
const KeyHint: FC<{ children: ReactNode }> = ({ children }) => (
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

// Format relative time
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

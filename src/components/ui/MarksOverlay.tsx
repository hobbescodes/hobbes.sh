import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo } from "react";

import { useMarks } from "@/context/MarksContext";

import type { FC } from "react";

interface MarksOverlayProps {
  onClose: () => void;
}

export const MarksOverlay: FC<MarksOverlayProps> = ({ onClose }) => {
  const { marks } = useMarks();
  const navigate = useNavigate();

  // Sort marks alphabetically by key
  const sortedMarks = useMemo(() => {
    return Object.entries(marks).sort(([a], [b]) => a.localeCompare(b));
  }, [marks]);

  const handleJumpToMark = useCallback(
    (path: string) => {
      navigate({ to: path as "/", search: {} });
      onClose();
    },
    [navigate, onClose],
  );

  // Keyboard handling - use capture phase to intercept before NavigationContext
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if it's a valid mark key (a-z) and we have that mark
      if (/^[a-z]$/.test(e.key) && marks[e.key]) {
        e.preventDefault();
        e.stopPropagation();
        handleJumpToMark(marks[e.key].path);
        return;
      }

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          onClose();
          break;
        default:
          // Stop propagation for any other keys to prevent navigation
          e.stopPropagation();
          break;
      }
    };

    // Use capture phase to intercept events before they bubble to NavigationContext
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [marks, handleJumpToMark, onClose]);

  // Format the display path (add ~/ prefix if needed)
  const formatPath = (displayName: string): string => {
    return `~/hobbescodes/${displayName}`;
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(17, 17, 27, 0.85)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-lg"
        style={{
          backgroundColor: "var(--base)",
          border: "1px solid var(--surface0)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
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
          Marks
        </div>

        {/* Marks list */}
        <div className="p-2">
          {sortedMarks.length === 0 ? (
            <div
              className="px-3 py-4 text-center text-sm"
              style={{ color: "var(--overlay1)" }}
            >
              No marks set
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div
                className="flex items-center gap-4 px-3 py-1 text-xs"
                style={{ color: "var(--overlay1)" }}
              >
                <span className="w-8">mark</span>
                <span className="flex-1">file</span>
              </div>

              {/* Mark entries */}
              {sortedMarks.map(([key, mark]) => (
                <button
                  key={key}
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-4 rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-[--surface1]"
                  style={{
                    color: "var(--text)",
                  }}
                  onClick={() => handleJumpToMark(mark.path)}
                >
                  {/* Mark letter */}
                  <span
                    className="w-8 font-bold font-mono"
                    style={{ color: "var(--blue)" }}
                  >
                    {key}
                  </span>

                  {/* File path */}
                  <span
                    className="flex-1 truncate font-mono"
                    style={{ color: "var(--subtext0)" }}
                  >
                    {formatPath(mark.displayName)}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-center gap-6 px-4 py-2 text-xs"
          style={{
            backgroundColor: "var(--surface0)",
            color: "var(--overlay1)",
            borderTop: "1px solid var(--surface1)",
          }}
        >
          <span>
            <KeyHint>a-z</KeyHint> jump to mark
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

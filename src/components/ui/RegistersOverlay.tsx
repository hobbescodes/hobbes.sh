import { useEffect } from "react";

import { useMacros } from "@/context/MacroContext";

import type { FC } from "react";

interface RegistersOverlayProps {
  onClose: () => void;
}

export const RegistersOverlay: FC<RegistersOverlayProps> = ({ onClose }) => {
  const { macros, getDisplayKeys, lastExecutedRegister } = useMacros();

  const registerEntries = Object.entries(macros).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  const usedCount = registerEntries.length;
  const availableCount = 26 - usedCount;

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "q") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose]);

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
          Registers
        </div>

        {/* Register list */}
        <div
          className="flex-1 overflow-y-auto p-4"
          style={{ minHeight: "150px", maxHeight: "400px" }}
        >
          {registerEntries.length === 0 ? (
            <div
              className="py-4 text-center text-sm"
              style={{ color: "var(--overlay0)" }}
            >
              No macros recorded
              <div
                className="mt-2 text-xs"
                style={{ color: "var(--overlay1)" }}
              >
                Press <KeyHint>q</KeyHint> then <KeyHint>a-z</KeyHint> to start
                recording
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {registerEntries.map(([key, macro]) => {
                const isLastExecuted = key === lastExecutedRegister;
                const displayKeys = getDisplayKeys(key);
                const truncatedKeys =
                  displayKeys.length > 40
                    ? `${displayKeys.slice(0, 40)}...`
                    : displayKeys;

                return (
                  <div
                    key={key}
                    className="flex items-start gap-3 rounded p-2"
                    style={{
                      backgroundColor: isLastExecuted
                        ? "var(--surface1)"
                        : "var(--surface0)",
                    }}
                  >
                    {/* Register key */}
                    <div className="flex items-center gap-1">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded font-bold font-mono text-sm"
                        style={{
                          backgroundColor: "var(--surface2)",
                          color: isLastExecuted
                            ? "var(--green)"
                            : "var(--blue)",
                        }}
                      >
                        {key}
                      </span>
                      {isLastExecuted && (
                        <span
                          className="text-xs"
                          style={{ color: "var(--green)" }}
                        >
                          @@
                        </span>
                      )}
                    </div>

                    {/* Key sequence */}
                    <div className="flex-1">
                      <div
                        className="font-mono text-sm"
                        style={{ color: "var(--text)" }}
                      >
                        {truncatedKeys}
                      </div>
                      <div
                        className="mt-1 text-xs"
                        style={{ color: "var(--overlay1)" }}
                      >
                        {macro.keys.length} key{macro.keys.length !== 1 && "s"}{" "}
                        • {formatDate(macro.recordedAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary */}
        <div
          className="px-4 py-2 text-center text-xs"
          style={{
            backgroundColor: "var(--surface0)",
            color: "var(--overlay1)",
            borderTop: "1px solid var(--surface1)",
          }}
        >
          {usedCount} register{usedCount !== 1 && "s"}, {availableCount}{" "}
          available
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
            <KeyHint>@a-z</KeyHint> replay
          </span>
          <span>
            <KeyHint>@@</KeyHint> replay last
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

// Format date
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

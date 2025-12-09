import type { FC } from "react";

interface CommandLineProps {
  buffer: string;
  error: string | null;
  /** When true, displays count mode (no : prefix, peach colored digits) */
  isCountMode?: boolean;
  /** Pending operator (e.g., 'g' waiting for next key) */
  pendingOperator?: string | null;
}

export const CommandLine: FC<CommandLineProps> = ({
  buffer,
  error,
  isCountMode = false,
  pendingOperator = null,
}) => {
  return (
    <div
      className="flex h-6 items-center px-2 font-mono text-sm"
      style={{
        backgroundColor: "var(--surface0)",
        borderTop: "1px solid var(--surface1)",
      }}
    >
      {error ? (
        // Error state
        <span style={{ color: "var(--red)" }}>{error}</span>
      ) : pendingOperator ? (
        // Pending operator mode - show operator in yellow/peach
        <>
          <span style={{ color: "var(--yellow)" }}>{pendingOperator}</span>
          <span
            className="ml-0.5 h-4 w-2 animate-pulse"
            style={{ backgroundColor: "var(--cursor)" }}
          />
        </>
      ) : isCountMode ? (
        // Count mode - show digits in peach color, no prefix
        <>
          <span style={{ color: "var(--peach)" }}>{buffer}</span>
          <span
            className="ml-0.5 h-4 w-2 animate-pulse"
            style={{ backgroundColor: "var(--cursor)" }}
          />
        </>
      ) : (
        // Command mode - show : prefix
        <>
          <span style={{ color: "var(--blue)" }}>:</span>
          <span style={{ color: "var(--text)" }}>{buffer}</span>
          <span
            className="ml-0.5 h-4 w-2 animate-pulse"
            style={{ backgroundColor: "var(--cursor)" }}
          />
        </>
      )}
    </div>
  );
};

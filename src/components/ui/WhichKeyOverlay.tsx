import { useMarks } from "@/context/MarksContext";

import type { FC } from "react";
import type { MarksRecord } from "@/context/MarksContext";

interface WhichKeyOverlayProps {
  pendingOperator: string;
}

export const WhichKeyOverlay: FC<WhichKeyOverlayProps> = ({
  pendingOperator,
}) => {
  const { marks } = useMarks();

  return (
    <div className="absolute right-4 bottom-10 z-40 animate-fade-in">
      <div
        className="overflow-hidden rounded-lg"
        style={{
          backgroundColor: "var(--base)",
          border: "1px solid var(--surface1)",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
          minWidth: "180px",
          maxWidth: "280px",
        }}
      >
        {pendingOperator === "g" && <GCommandHints />}
        {pendingOperator === "m" && <SetMarkHints marks={marks} />}
        {pendingOperator === "'" && <JumpToMarkHints marks={marks} />}
      </div>
    </div>
  );
};

/**
 * Hints for 'g' commands
 */
const GCommandHints: FC = () => {
  return (
    <div className="p-3">
      {/* Header */}
      <div
        className="mb-2 flex items-center gap-2 border-b pb-2 font-bold text-sm"
        style={{
          borderColor: "var(--surface0)",
          color: "var(--blue)",
        }}
      >
        <KeyBadge>g</KeyBadge>
        <span style={{ color: "var(--subtext0)" }}>+</span>
      </div>

      {/* Commands */}
      <div className="space-y-1.5">
        <HintRow keyChar="x" description="open link in browser" />
        {/* Future: Add more g commands */}
        {/* <HintRow keyChar="g" description="go to top" /> */}
      </div>
    </div>
  );
};

/**
 * Hints for 'm' (set mark) - shows all 26 letters with used ones highlighted
 */
const SetMarkHints: FC<{ marks: MarksRecord }> = ({ marks }) => {
  const usedMarks = new Set(Object.keys(marks));

  return (
    <div className="p-3">
      {/* Header */}
      <div
        className="mb-2 flex items-center gap-2 border-b pb-2 font-bold text-sm"
        style={{
          borderColor: "var(--surface0)",
          color: "var(--blue)",
        }}
      >
        <KeyBadge>m</KeyBadge>
        <span style={{ color: "var(--subtext0)" }}>set mark</span>
      </div>

      {/* Letter grid */}
      <div className="grid grid-cols-9 gap-1">
        {Array.from({ length: 26 }, (_, i) => {
          const letter = String.fromCharCode(97 + i); // a-z
          const isUsed = usedMarks.has(letter);

          return (
            <span
              key={letter}
              className="flex h-6 w-6 items-center justify-center rounded font-mono text-xs"
              style={{
                backgroundColor: isUsed ? "var(--surface1)" : "transparent",
                color: isUsed ? "var(--green)" : "var(--overlay0)",
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>

      {/* Legend */}
      <div
        className="mt-2 flex items-center gap-2 border-t pt-2 text-xs"
        style={{
          borderColor: "var(--surface0)",
          color: "var(--overlay1)",
        }}
      >
        <span
          className="h-2 w-2 rounded-sm"
          style={{ backgroundColor: "var(--green)" }}
        />
        <span>used</span>
      </div>
    </div>
  );
};

/**
 * Hints for "'" (jump to mark) - shows only existing marks with their paths
 */
const JumpToMarkHints: FC<{ marks: MarksRecord }> = ({ marks }) => {
  const markEntries = Object.entries(marks).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <div className="p-3">
      {/* Header */}
      <div
        className="mb-2 flex items-center gap-2 border-b pb-2 font-bold text-sm"
        style={{
          borderColor: "var(--surface0)",
          color: "var(--blue)",
        }}
      >
        <KeyBadge>'</KeyBadge>
        <span style={{ color: "var(--subtext0)" }}>jump to mark</span>
      </div>

      {/* Mark list */}
      {markEntries.length === 0 ? (
        <div
          className="py-2 text-center text-xs"
          style={{ color: "var(--overlay0)" }}
        >
          no marks set
        </div>
      ) : (
        <div className="space-y-1">
          {markEntries.map(([key, mark]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <span
                className="flex h-5 w-5 items-center justify-center rounded font-bold font-mono"
                style={{
                  backgroundColor: "var(--surface1)",
                  color: "var(--green)",
                }}
              >
                {key}
              </span>
              <span
                className="truncate font-mono"
                style={{ color: "var(--subtext0)" }}
              >
                {mark.displayName}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Key badge component for displaying a key
 */
const KeyBadge: FC<{ children: React.ReactNode }> = ({ children }) => (
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

/**
 * Single hint row with key and description
 */
const HintRow: FC<{ keyChar: string; description: string }> = ({
  keyChar,
  description,
}) => (
  <div className="flex items-center gap-2 text-xs">
    <span
      className="flex h-5 w-5 items-center justify-center rounded font-mono"
      style={{
        backgroundColor: "var(--surface1)",
        color: "var(--blue)",
      }}
    >
      {keyChar}
    </span>
    <span style={{ color: "var(--subtext0)" }}>{description}</span>
  </div>
);

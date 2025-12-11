import { useBuffers } from "@/context/BufferContext";
import { useMacros } from "@/context/MacroContext";
import { useMarks } from "@/context/MarksContext";

import type { FC } from "react";
import type { Buffer } from "@/context/BufferContext";
import type { MacrosRecord } from "@/context/MacroContext";
import type { MarksRecord } from "@/context/MarksContext";

interface WhichKeyOverlayProps {
  pendingOperator: string;
}

export const WhichKeyOverlay: FC<WhichKeyOverlayProps> = ({
  pendingOperator,
}) => {
  const { marks } = useMarks();
  const { buffers, currentBufferId, alternateBufferId } = useBuffers();
  const { macros, isRecording, lastExecutedRegister, getDisplayKeys } =
    useMacros();

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
        {pendingOperator === "b" && (
          <BufferHints
            buffers={buffers}
            currentBufferId={currentBufferId}
            alternateBufferId={alternateBufferId}
          />
        )}
        {pendingOperator === "q" && (
          <RecordMacroHints macros={macros} isRecording={isRecording} />
        )}
        {pendingOperator === "@" && (
          <ReplayMacroHints
            macros={macros}
            lastExecutedRegister={lastExecutedRegister}
            getDisplayKeys={getDisplayKeys}
          />
        )}
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
 * Hints for "b" (switch buffer) - shows available buffers with their numbers
 */
const BufferHints: FC<{
  buffers: Buffer[];
  currentBufferId: number | null;
  alternateBufferId: number | null;
}> = ({ buffers, currentBufferId, alternateBufferId }) => {
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
        <KeyBadge>b</KeyBadge>
        <span style={{ color: "var(--subtext0)" }}>switch buffer</span>
      </div>

      {/* Buffer list */}
      {buffers.length === 0 ? (
        <div
          className="py-2 text-center text-xs"
          style={{ color: "var(--overlay0)" }}
        >
          no buffers open
        </div>
      ) : (
        <div className="space-y-1">
          {buffers.slice(0, 9).map((buffer, index) => {
            const isCurrent = buffer.id === currentBufferId;
            const isAlternate = buffer.id === alternateBufferId && !isCurrent;
            const displayNumber = index + 1;

            return (
              <div key={buffer.id} className="flex items-center gap-2 text-xs">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded font-bold font-mono"
                  style={{
                    backgroundColor: isCurrent
                      ? "var(--surface2)"
                      : "var(--surface1)",
                    color: isCurrent
                      ? "var(--green)"
                      : isAlternate
                        ? "var(--yellow)"
                        : "var(--blue)",
                  }}
                >
                  {displayNumber}
                </span>
                <span
                  className="truncate font-mono"
                  style={{
                    color: isCurrent ? "var(--text)" : "var(--subtext0)",
                  }}
                >
                  {buffer.displayName}
                </span>
                {isCurrent && (
                  <span className="text-xs" style={{ color: "var(--green)" }}>
                    %
                  </span>
                )}
                {isAlternate && (
                  <span className="text-xs" style={{ color: "var(--yellow)" }}>
                    #
                  </span>
                )}
              </div>
            );
          })}
          {/* Show alternate buffer hint */}
          {alternateBufferId !== null && (
            <div
              className="mt-2 flex items-center gap-2 border-t pt-2 text-xs"
              style={{ borderColor: "var(--surface0)" }}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded font-bold font-mono"
                style={{
                  backgroundColor: "var(--surface1)",
                  color: "var(--yellow)",
                }}
              >
                #
              </span>
              <span style={{ color: "var(--subtext0)" }}>alternate buffer</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Hints for "q" (record macro) - shows registers and recording state
 */
const RecordMacroHints: FC<{
  macros: MacrosRecord;
  isRecording: boolean;
}> = ({ macros, isRecording }) => {
  const usedRegisters = new Set(Object.keys(macros));

  if (isRecording) {
    return (
      <div className="p-3">
        <div
          className="flex items-center gap-2 text-sm"
          style={{ color: "var(--red)" }}
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
          <span>Press q to stop recording</span>
        </div>
      </div>
    );
  }

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
        <KeyBadge>q</KeyBadge>
        <span style={{ color: "var(--subtext0)" }}>record macro</span>
      </div>

      {/* Letter grid */}
      <div className="grid grid-cols-9 gap-1">
        {Array.from({ length: 26 }, (_, i) => {
          const letter = String.fromCharCode(97 + i); // a-z
          const isUsed = usedRegisters.has(letter);

          return (
            <span
              key={letter}
              className="flex h-6 w-6 items-center justify-center rounded font-mono text-xs"
              style={{
                backgroundColor: isUsed ? "var(--surface1)" : "transparent",
                color: isUsed ? "var(--red)" : "var(--overlay0)",
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
          style={{ backgroundColor: "var(--red)" }}
        />
        <span>has macro (will overwrite)</span>
      </div>
    </div>
  );
};

/**
 * Hints for "@" (replay macro) - shows available macros
 */
const ReplayMacroHints: FC<{
  macros: MacrosRecord;
  lastExecutedRegister: string | null;
  getDisplayKeys: (register: string) => string;
}> = ({ macros, lastExecutedRegister, getDisplayKeys }) => {
  const macroEntries = Object.entries(macros).sort(([a], [b]) =>
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
        <KeyBadge>@</KeyBadge>
        <span style={{ color: "var(--subtext0)" }}>replay macro</span>
      </div>

      {/* Macro list */}
      {macroEntries.length === 0 ? (
        <div
          className="py-2 text-center text-xs"
          style={{ color: "var(--overlay0)" }}
        >
          no macros recorded
        </div>
      ) : (
        <div className="space-y-1">
          {macroEntries.slice(0, 6).map(([key]) => {
            const isLast = key === lastExecutedRegister;
            const displayKeys = getDisplayKeys(key);
            const truncated =
              displayKeys.length > 20
                ? `${displayKeys.slice(0, 20)}...`
                : displayKeys;

            return (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded font-bold font-mono"
                  style={{
                    backgroundColor: isLast
                      ? "var(--surface2)"
                      : "var(--surface1)",
                    color: isLast ? "var(--green)" : "var(--blue)",
                  }}
                >
                  {key}
                </span>
                <span
                  className="truncate font-mono"
                  style={{ color: "var(--subtext0)" }}
                >
                  {truncated}
                </span>
                {isLast && (
                  <span className="text-xs" style={{ color: "var(--green)" }}>
                    @@
                  </span>
                )}
              </div>
            );
          })}
          {macroEntries.length > 6 && (
            <div className="text-xs" style={{ color: "var(--overlay0)" }}>
              +{macroEntries.length - 6} more
            </div>
          )}
          {/* @@ hint */}
          {lastExecutedRegister && (
            <div
              className="mt-2 flex items-center gap-2 border-t pt-2 text-xs"
              style={{ borderColor: "var(--surface0)" }}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded font-bold font-mono"
                style={{
                  backgroundColor: "var(--surface1)",
                  color: "var(--green)",
                }}
              >
                @
              </span>
              <span style={{ color: "var(--subtext0)" }}>
                replay last (@{lastExecutedRegister})
              </span>
            </div>
          )}
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

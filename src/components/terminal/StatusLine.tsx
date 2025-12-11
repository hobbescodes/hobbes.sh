import type { FC } from "react";
import type { NavigationMode } from "@/context/NavigationContext";

interface StatusLineProps {
  filepath: string;
  filetype?: string;
  encoding?: string;
  mode: NavigationMode;
  line?: number;
  col?: number;
  isRecording?: boolean;
  recordingRegister?: string | null;
}

const modeStyles: Record<string, { bg: string; text: string }> = {
  NORMAL: { bg: "var(--blue)", text: "var(--crust)" },
  INSERT: { bg: "var(--green)", text: "var(--crust)" },
  COMMAND: { bg: "var(--peach)", text: "var(--crust)" },
  SEARCH: { bg: "var(--mauve)", text: "var(--crust)" },
  GAME: { bg: "var(--green)", text: "var(--crust)" },
};

export const StatusLine: FC<StatusLineProps> = ({
  filepath,
  filetype = "text",
  encoding = "utf-8",
  mode,
  line = 1,
  col = 1,
  isRecording = false,
  recordingRegister = null,
}) => {
  const modeStyle = modeStyles[mode];

  return (
    <div
      className="flex h-6 select-none items-center text-xs"
      style={{
        backgroundColor: "var(--mantle)",
        borderTop: "1px solid var(--surface0)",
      }}
    >
      {/* Mode indicator */}
      <div
        className="flex h-full items-center px-2 font-bold"
        style={{
          backgroundColor: modeStyle.bg,
          color: modeStyle.text,
        }}
      >
        {mode}
      </div>

      {/* Recording indicator */}
      {isRecording && recordingRegister && (
        <div
          className="flex h-full animate-pulse items-center gap-1 px-2 font-bold"
          style={{
            backgroundColor: "var(--red)",
            color: "var(--crust)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          <span>@{recordingRegister}</span>
        </div>
      )}

      {/* File path */}
      <div className="flex-1 truncate px-3" style={{ color: "var(--text)" }}>
        {/* Show only filename on mobile, full path on sm+ */}
        <span className="sm:hidden">
          {filepath.split("/").pop() || filepath}
        </span>
        <span className="hidden sm:inline">{filepath}</span>
      </div>

      {/* Right side info */}
      <div
        className="flex items-center gap-4 px-3"
        style={{ color: "var(--subtext0)" }}
      >
        <span>[{filetype}]</span>
        {/* Hide encoding on small screens */}
        <span className="hidden sm:inline">{encoding}</span>
        <span>
          {line}:{col}
        </span>
      </div>
    </div>
  );
};

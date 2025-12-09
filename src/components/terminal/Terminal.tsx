import { CommandLine } from "@/components/editor/CommandLine";
import { StatusLine } from "@/components/terminal/StatusLine";
import { TitleBar } from "@/components/terminal/TitleBar";
import { HelpOverlay } from "@/components/ui/HelpOverlay";
import { SearchOverlay } from "@/components/ui/SearchOverlay";
import { useNavigation } from "@/context/NavigationContext";

import type { FC, ReactNode } from "react";

interface TerminalProps {
  children: ReactNode;
  title: string;
  filepath: string;
  filetype?: string;
  line?: number;
  col?: number;
}

export const Terminal: FC<TerminalProps> = ({
  children,
  title,
  filepath,
  filetype = "text",
  line = 1,
  col = 1,
}) => {
  const {
    mode,
    setMode,
    commandBuffer,
    commandError,
    countBuffer,
    pendingOperator,
    searchQuery,
    searchResults,
    selectedSearchIndex,
    showHelp,
    setShowHelp,
  } = useNavigation();

  return (
    // Outer container - centers the terminal with wallpaper background
    <div
      className="relative flex min-h-screen w-screen items-center justify-center p-4 md:p-8"
      style={{
        backgroundImage: "url(/wallpaper.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Semi-transparent overlay for wallpaper */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--wallpaper-overlay)" }}
      />

      {/* Terminal window */}
      <div
        className="relative z-10 flex h-[80vh] w-[70vw] min-w-[600px] flex-col overflow-hidden rounded-lg shadow-2xl"
        style={{
          backgroundColor: "var(--terminal-bg)",
          border: "1px solid var(--surface0)",
        }}
      >
        {/* macOS-style title bar */}
        <TitleBar title={title} />

        {/* Main content area */}
        <div className="flex-1 overflow-hidden">{children}</div>

        {/* Command line (shown in COMMAND mode, count buffer, or pending operator) */}
        {(mode === "COMMAND" || countBuffer || pendingOperator) && (
          <CommandLine
            buffer={mode === "COMMAND" ? commandBuffer : countBuffer}
            error={commandError}
            isCountMode={
              mode !== "COMMAND" && !!countBuffer && !pendingOperator
            }
            pendingOperator={pendingOperator}
          />
        )}

        {/* Vim-style status line */}
        <StatusLine
          filepath={filepath}
          filetype={filetype}
          mode={mode}
          line={line}
          col={col}
        />

        {/* Help overlay */}
        {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}

        {/* Search overlay */}
        {mode === "SEARCH" && (
          <SearchOverlay
            query={searchQuery}
            results={searchResults}
            selectedIndex={selectedSearchIndex}
            onClose={() => setMode("NORMAL")}
          />
        )}
      </div>
    </div>
  );
};

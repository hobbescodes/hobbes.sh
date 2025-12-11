import { CommandLine } from "@/components/editor/CommandLine";
import { StatusLine } from "@/components/terminal/StatusLine";
import { TitleBar } from "@/components/terminal/TitleBar";
import { ColorschemeOverlay } from "@/components/ui/ColorschemeOverlay";
import { HelpOverlay } from "@/components/ui/HelpOverlay";
import { MarksOverlay } from "@/components/ui/MarksOverlay";
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
    showColorscheme,
    setShowColorscheme,
    showMarks,
    setShowMarks,
  } = useNavigation();

  return (
    // Outer container - centers the terminal with wallpaper background
    <div
      className="relative flex min-h-[100dvh] min-h-screen w-screen items-center justify-center p-1 sm:p-2 md:p-4 lg:p-8"
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
        className="relative z-10 flex h-[95dvh] h-[95vh] w-full flex-col overflow-hidden rounded-lg shadow-2xl md:h-[92dvh] md:h-[92vh] md:w-[95vw] lg:h-[85dvh] lg:h-[85vh] lg:w-[80vw] xl:h-[80dvh] xl:h-[80vh] xl:w-[70vw]"
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

        {/* Colorscheme overlay */}
        {showColorscheme && (
          <ColorschemeOverlay onClose={() => setShowColorscheme(false)} />
        )}

        {/* Marks overlay */}
        {showMarks && <MarksOverlay onClose={() => setShowMarks(false)} />}
      </div>
    </div>
  );
};

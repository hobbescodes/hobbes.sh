import type { FC } from "react";

interface HelpOverlayProps {
  onClose: () => void;
}

export const HelpOverlay: FC<HelpOverlayProps> = ({ onClose }) => {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(17, 17, 27, 0.85)" }} // --crust with opacity
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-2xl overflow-hidden rounded-lg"
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
          Help
        </div>

        {/* Content - 2x2 Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm">
            {/* Navigation Section */}
            <div>
              <h3
                className="mb-3 pb-1 font-bold"
                style={{
                  color: "var(--peach)",
                  borderBottom: "1px solid var(--surface1)",
                }}
              >
                Navigation
              </h3>
              <div className="space-y-2">
                <KeyBinding keys="j / ↓" description="Move down" />
                <KeyBinding keys="k / ↑" description="Move up" />
                <KeyBinding keys="{n}j/k" description="Move n lines" />
                <KeyBinding keys="Ctrl+d/u" description="Scroll half page" />
                <KeyBinding keys="Ctrl+o/i" description="Jump back/forward" />
                <KeyBinding keys="Enter" description="Open" />
                <KeyBinding keys="gx" description="Open link" />
                <KeyBinding keys="-" description="Parent" />
              </div>
            </div>

            {/* Buffers Section */}
            <div>
              <h3
                className="mb-3 pb-1 font-bold"
                style={{
                  color: "var(--peach)",
                  borderBottom: "1px solid var(--surface1)",
                }}
              >
                Buffers
              </h3>
              <div className="space-y-2">
                <KeyBinding keys="b{1-9}" description="Switch to buffer" />
                <KeyBinding keys="b#" description="Alternate buffer" />
                <KeyBinding keys=":ls" description="List buffers" />
                <KeyBinding keys=":bd / :bda" description="Close / close all" />
              </div>
            </div>

            {/* Modes Section */}
            <div>
              <h3
                className="mb-3 pb-1 font-bold"
                style={{
                  color: "var(--peach)",
                  borderBottom: "1px solid var(--surface1)",
                }}
              >
                Modes
              </h3>
              <div className="space-y-2">
                <KeyBinding keys=":" description="Command mode" />
                <KeyBinding keys="/" description="Search mode" />
                <KeyBinding keys="?" description="Help" />
                <KeyBinding keys="Esc" description="Normal mode" />
              </div>
            </div>

            {/* Macros Section */}
            <div>
              <h3
                className="mb-3 pb-1 font-bold"
                style={{
                  color: "var(--peach)",
                  borderBottom: "1px solid var(--surface1)",
                }}
              >
                Macros
              </h3>
              <div className="space-y-2">
                <KeyBinding keys="q{a-z}" description="Record macro" />
                <KeyBinding keys="q" description="Stop recording" />
                <KeyBinding keys="@{a-z}" description="Replay macro" />
                <KeyBinding keys="@@" description="Replay last" />
              </div>
            </div>

            {/* Telescope Section */}
            <div>
              <h3
                className="mb-3 pb-1 font-bold"
                style={{
                  color: "var(--peach)",
                  borderBottom: "1px solid var(--surface1)",
                }}
              >
                Telescope
              </h3>
              <div className="space-y-2">
                <KeyBinding keys=":Tel ff" description="Find files" />
                <KeyBinding keys=":Tel buf" description="Buffers" />
                <KeyBinding keys=":Tel m" description="Marks" />
                <KeyBinding keys=":Tel cmd" description="Commands" />
              </div>
            </div>

            {/* Projects Section (Split Panes) */}
            <div>
              <h3
                className="mb-3 pb-1 font-bold"
                style={{
                  color: "var(--peach)",
                  borderBottom: "1px solid var(--surface1)",
                }}
              >
                Projects
              </h3>
              <div className="space-y-2">
                <KeyBinding keys="Enter" description="Open preview" />
                <KeyBinding keys="^a l" description="Focus preview" />
                <KeyBinding keys="^a h" description="Focus content" />
                <KeyBinding keys="^a x" description="Close preview" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 text-center text-xs"
          style={{
            backgroundColor: "var(--surface0)",
            color: "var(--overlay1)",
            borderTop: "1px solid var(--surface1)",
          }}
        >
          <div>
            Press <span style={{ color: "var(--blue)" }}>?</span> or{" "}
            <span style={{ color: "var(--blue)" }}>Esc</span> to close
          </div>
          <div className="mt-1" style={{ color: "var(--overlay0)" }}>
            Tip: Hold <span style={{ color: "var(--green)" }}>g</span>,{" "}
            <span style={{ color: "var(--green)" }}>m</span>,{" "}
            <span style={{ color: "var(--green)" }}>'</span>,{" "}
            <span style={{ color: "var(--green)" }}>b</span>,{" "}
            <span style={{ color: "var(--green)" }}>q</span>, or{" "}
            <span style={{ color: "var(--green)" }}>@</span> for hints
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for key bindings
interface KeyBindingProps {
  keys: string;
  description: string;
}

const KeyBinding: FC<KeyBindingProps> = ({ keys, description }) => {
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        className="rounded px-1.5 py-0.5 font-mono text-xs"
        style={{
          backgroundColor: "var(--surface1)",
          color: "var(--blue)",
        }}
      >
        {keys}
      </span>
      <span className="whitespace-nowrap" style={{ color: "var(--subtext0)" }}>
        {description}
      </span>
    </div>
  );
};

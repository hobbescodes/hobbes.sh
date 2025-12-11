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
                <KeyBinding keys="Ctrl+d" description="Scroll down" />
                <KeyBinding keys="Ctrl+u" description="Scroll up" />
                <KeyBinding keys="Enter" description="Open" />
                <KeyBinding keys="gx" description="Open link" />
                <KeyBinding keys="-" description="Parent" />
              </div>
            </div>

            {/* History Section */}
            <div>
              <h3
                className="mb-3 pb-1 font-bold"
                style={{
                  color: "var(--peach)",
                  borderBottom: "1px solid var(--surface1)",
                }}
              >
                History
              </h3>
              <div className="space-y-2">
                <KeyBinding keys="Ctrl+o" description="Jump back" />
                <KeyBinding keys="Ctrl+i" description="Jump forward" />
                <KeyBinding keys=":recent" description="Recent files" />
                <KeyBinding keys=":history" description="Recent files" />
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

            {/* Marks Section */}
            <div>
              <h3
                className="mb-3 pb-1 font-bold"
                style={{
                  color: "var(--peach)",
                  borderBottom: "1px solid var(--surface1)",
                }}
              >
                Marks
              </h3>
              <div className="space-y-2">
                <KeyBinding keys="m{a-z}" description="Set mark" />
                <KeyBinding keys="'{a-z}" description="Jump to mark" />
                <KeyBinding keys=":marks" description="List marks" />
                <KeyBinding keys=":delmarks!" description="Delete all" />
              </div>
            </div>

            {/* Commands Section */}
            <div>
              <h3
                className="mb-3 pb-1 font-bold"
                style={{
                  color: "var(--peach)",
                  borderBottom: "1px solid var(--surface1)",
                }}
              >
                Commands
              </h3>
              <div className="space-y-2">
                <KeyBinding keys=":q" description="Go home" />
                <KeyBinding keys=":e <path>" description="Open file" />
                <KeyBinding keys=":help" description="Show help" />
                <KeyBinding keys=":theme" description="Theme picker" />
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
          Press <span style={{ color: "var(--blue)" }}>?</span> or{" "}
          <span style={{ color: "var(--blue)" }}>Esc</span> to close
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

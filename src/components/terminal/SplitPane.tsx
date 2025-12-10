import { createContext, useContext } from "react";

import { usePane } from "@/context/PaneContext";

import type { FC, ReactNode } from "react";

// Context for passing split state to children
interface SplitPaneContextValue {
  isOpen: boolean;
}

const SplitPaneContext = createContext<SplitPaneContextValue | null>(null);

// Main SplitPane container props
interface SplitPaneProps {
  children: ReactNode;
  leftWidth?: string;
  rightWidth?: string;
}

// Sub-component props
interface PaneProps {
  children: ReactNode;
}

/**
 * SplitPane - A compound component for tmux-style vertical split panes
 *
 * Usage:
 * ```tsx
 * <SplitPane>
 *   <SplitPane.Left>
 *     <Buffer>...</Buffer>
 *   </SplitPane.Left>
 *   <SplitPane.Right>
 *     <ProjectPreview />
 *   </SplitPane.Right>
 * </SplitPane>
 * ```
 */
const SplitPaneRoot: FC<SplitPaneProps> = ({
  children,
  leftWidth = "50%",
  rightWidth = "50%",
}) => {
  const { isPreviewOpen } = usePane();

  return (
    <SplitPaneContext.Provider value={{ isOpen: isPreviewOpen }}>
      <div
        className="flex h-full gap-2 p-2"
        style={
          {
            "--left-width": isPreviewOpen ? leftWidth : "100%",
            "--right-width": isPreviewOpen ? rightWidth : "0%",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </SplitPaneContext.Provider>
  );
};

// Left pane (content/buffer)
const Left: FC<PaneProps> = ({ children }) => {
  const context = useContext(SplitPaneContext);
  const { activePane, isPreviewOpen } = usePane();

  if (!context) {
    throw new Error("SplitPane.Left must be used within a SplitPane");
  }

  const isActive = activePane === "left";
  const borderColor = isPreviewOpen
    ? `var(${isActive ? "--blue" : "--surface2"})`
    : "transparent";

  return (
    <div
      className="relative h-full overflow-hidden transition-all duration-200"
      style={{
        width: "var(--left-width)",
        border: `1px solid ${borderColor}`,
      }}
    >
      {children}
      {/* Inactive overlay */}
      {isPreviewOpen && !isActive && (
        <div className="pointer-events-none absolute inset-1 bg-white opacity-5" />
      )}
    </div>
  );
};

// Right pane (preview)
const Right: FC<PaneProps> = ({ children }) => {
  const context = useContext(SplitPaneContext);
  const { activePane, isPreviewOpen } = usePane();

  if (!context) {
    throw new Error("SplitPane.Right must be used within a SplitPane");
  }

  const isActive = activePane === "right";

  if (!isPreviewOpen) {
    return null;
  }

  return (
    <div
      className="relative h-full overflow-hidden transition-all duration-200"
      style={{
        width: "var(--right-width)",
        border: `1px solid var(${isActive ? "--blue" : "--surface2"})`,
      }}
    >
      {children}
      {/* Inactive overlay */}
      {!isActive && (
        <div className="pointer-events-none absolute inset-1 bg-white opacity-5" />
      )}
    </div>
  );
};

// Attach sub-components
export const SplitPane = Object.assign(SplitPaneRoot, {
  Left,
  Right,
});

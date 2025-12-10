import { createContext, useContext } from "react";

import { usePane } from "@/context/PaneContext";
import { cn } from "@/lib/utils";

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
 * SplitPane - A compound component for responsive split panes
 * - Mobile/Tablet (< 1024px): Horizontal split (stacked top/bottom)
 * - Desktop (>= 1024px): Vertical split (side-by-side)
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
const SplitPaneRoot: FC<SplitPaneProps> = ({ children }) => {
  const { isPreviewOpen } = usePane();

  return (
    <SplitPaneContext.Provider value={{ isOpen: isPreviewOpen }}>
      <div
        className={cn(
          "flex h-full gap-2 p-2",
          // Horizontal split (stacked) on mobile/tablet when preview open
          // Vertical split (side-by-side) on desktop
          isPreviewOpen ? "3xl:flex-row flex-col" : "flex-row",
        )}
      >
        {children}
      </div>
    </SplitPaneContext.Provider>
  );
};

// Left pane (content/buffer)
const Left: FC<PaneProps> = ({ children }) => {
  const context = useContext(SplitPaneContext);
  const { activePane, isPreviewOpen, setActivePane } = usePane();

  if (!context) {
    throw new Error("SplitPane.Left must be used within a SplitPane");
  }

  const isActive = activePane === "left";
  const borderColor = isPreviewOpen
    ? `var(${isActive ? "--blue" : "--surface2"})`
    : "transparent";

  return (
    <div
      className={cn(
        "relative flex-1 overflow-hidden transition-all duration-200",
        isPreviewOpen && "cursor-pointer",
      )}
      style={{
        border: `1px solid ${borderColor}`,
      }}
      onClick={() => setActivePane("left")}
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
  const { activePane, isPreviewOpen, setActivePane } = usePane();

  if (!context) {
    throw new Error("SplitPane.Right must be used within a SplitPane");
  }

  const isActive = activePane === "right";

  if (!isPreviewOpen) {
    return null;
  }

  return (
    <div
      className="relative flex-1 cursor-pointer overflow-hidden transition-all duration-200"
      style={{
        border: `1px solid var(${isActive ? "--blue" : "--surface2"})`,
      }}
      onClick={() => setActivePane("right")}
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

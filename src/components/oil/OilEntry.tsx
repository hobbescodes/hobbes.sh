import { cn } from "@/lib/utils";

import type { FC, ReactNode } from "react";
import type { RouteEntry } from "@/types";

interface OilEntryProps {
  entry: RouteEntry;
  isSelected: boolean;
  isParent?: boolean;
  children?: ReactNode; // Allow additional content after the entry name
  onClick?: () => void; // Click handler for mouse navigation
}

export const OilEntry: FC<OilEntryProps> = ({
  entry,
  isSelected,
  isParent = false,
  children,
  onClick,
}) => {
  const displayText = isParent ? "../" : entry.displayName;
  const isDirectory = isParent || entry.type === "directory";

  return (
    <div
      className={cn(
        "relative flex items-center leading-[1.6]",
        onClick &&
          "cursor-pointer transition-colors active:bg-[var(--surface0)]",
      )}
      style={{ color: isSelected ? "var(--text)" : "var(--subtext1)" }}
      onClick={onClick}
    >
      {/* Block cursor for selected item */}
      {isSelected && (
        <span
          className="absolute left-0 w-2"
          style={{
            backgroundColor: "var(--cursor)",
            height: "1.2em",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      )}

      {/* Content with padding for cursor - filename */}
      <span
        className="min-w-0 flex-1 truncate pl-4"
        style={{ color: isDirectory ? "var(--blue)" : undefined }}
      >
        {displayText}
      </span>

      {/* Additional content (e.g., metadata) - always visible */}
      {children && <span className="shrink-0">{children}</span>}
    </div>
  );
};

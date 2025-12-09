import { useCallback, useEffect, useState } from "react";

import { useNavigation } from "@/context/NavigationContext";

interface UseOilNavigationOptions {
  /** Total number of items including parent entry */
  totalItems: number;
  /** Initial selected index */
  initialIndex?: number;
  /** Handler called when navigating to an item by index */
  onNavigate: (index: number) => void;
  /** Handler called when navigating to parent via `-` key */
  onNavigateToParent: () => void;
}

interface UseOilNavigationReturn {
  /** Currently selected index */
  selectedIndex: number;
  /** Set the selected index */
  setSelectedIndex: (index: number) => void;
  /** Handle click on an item - navigates immediately */
  handleItemClick: (index: number) => void;
}

/**
 * Shared hook for oil-style navigation with keyboard and mouse support.
 * Handles j/k navigation, Enter to navigate, `-` for parent, and click-to-navigate.
 */
export function useOilNavigation({
  totalItems,
  initialIndex = 0,
  onNavigate,
  onNavigateToParent,
}: UseOilNavigationOptions): UseOilNavigationReturn {
  const { mode, getCount, setCountBuffer } = useNavigation();
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Don't handle navigation keys when in COMMAND or SEARCH mode
      if (mode !== "NORMAL") return;

      switch (e.key) {
        case "j":
        case "ArrowDown": {
          e.preventDefault();
          const count = getCount();
          setSelectedIndex((prev) => Math.min(prev + count, totalItems - 1));
          setCountBuffer("");
          break;
        }
        case "k":
        case "ArrowUp": {
          e.preventDefault();
          const count = getCount();
          setSelectedIndex((prev) => Math.max(prev - count, 0));
          setCountBuffer("");
          break;
        }
        case "Enter": {
          e.preventDefault();
          setCountBuffer("");
          onNavigate(selectedIndex);
          break;
        }
        case "-": {
          e.preventDefault();
          setCountBuffer("");
          onNavigateToParent();
          break;
        }
      }
    },
    [
      mode,
      getCount,
      setCountBuffer,
      totalItems,
      selectedIndex,
      onNavigate,
      onNavigateToParent,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Click handler - navigates immediately (single-click-to-navigate)
  const handleItemClick = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      onNavigate(index);
    },
    [onNavigate],
  );

  return {
    selectedIndex,
    setSelectedIndex,
    handleItemClick,
  };
}

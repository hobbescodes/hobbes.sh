import { useRouter } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { FC, ReactNode } from "react";

const MAX_HISTORY_ENTRIES = 50;

export interface HistoryEntry {
  path: string;
  displayName: string;
  timestamp: number;
}

interface HistoryContextValue {
  /** All history entries */
  entries: HistoryEntry[];
  /** Current position in history (-1 means at head/most recent) */
  currentIndex: number;
  /** Jump back in history (Ctrl+o) - returns path to navigate to */
  jumpBack: () => string | null;
  /** Jump forward in history (Ctrl+i) - returns path to navigate to */
  jumpForward: () => string | null;
  /** Can jump back? */
  canJumpBack: boolean;
  /** Can jump forward? */
  canJumpForward: boolean;
  /** Flag a navigation as jumplist traversal (won't be recorded) */
  setIsJumplistNavigation: (value: boolean) => void;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

/**
 * Get display name for a path (e.g., "/about" -> "about.md")
 */
function getDisplayNameFromPath(pathname: string): string {
  if (pathname === "/") return "home.md";

  // Remove leading slash
  const parts = pathname.slice(1).split("/");
  const lastPart = parts[parts.length - 1];

  // Check if it's a directory-style route
  if (pathname === "/projects" || pathname === "/blog") {
    return `${lastPart}/`;
  }

  return `${lastPart}.md`;
}

interface HistoryProviderProps {
  children: ReactNode;
}

export const HistoryProvider: FC<HistoryProviderProps> = ({ children }) => {
  const router = useRouter();

  // History state
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 means at head

  // Flag to prevent recording jumplist navigations
  const isJumplistNavigationRef = useRef(false);

  // Push a new entry to history
  const pushEntry = useCallback((path: string, displayName: string) => {
    setEntries((prev) => {
      // Don't add duplicate if same as last entry
      if (prev.length > 0 && prev[prev.length - 1].path === path) {
        return prev;
      }

      const newEntry: HistoryEntry = {
        path,
        displayName,
        timestamp: Date.now(),
      };

      // If we're not at head, truncate forward history
      let newEntries: HistoryEntry[];
      setCurrentIndex((currentIdx) => {
        if (currentIdx !== -1 && currentIdx < prev.length - 1) {
          // Truncate entries after current position
          newEntries = [...prev.slice(0, currentIdx + 1), newEntry];
        } else {
          newEntries = [...prev, newEntry];
        }
        return -1; // Reset to head
      });

      // Handle the case where setCurrentIndex callback runs after
      // We need to compute newEntries here too
      newEntries = [...prev, newEntry];

      // Enforce max entries
      if (newEntries.length > MAX_HISTORY_ENTRIES) {
        newEntries = newEntries.slice(-MAX_HISTORY_ENTRIES);
      }

      return newEntries;
    });

    // Always reset to head when pushing new entry
    setCurrentIndex(-1);
  }, []);

  // Jump back in history
  const jumpBack = useCallback((): string | null => {
    if (entries.length === 0) return null;

    let targetIndex: number;

    if (currentIndex === -1) {
      // At head, go to second-to-last entry
      targetIndex = entries.length - 2;
    } else {
      // Go back one more
      targetIndex = currentIndex - 1;
    }

    if (targetIndex < 0) return null;

    setCurrentIndex(targetIndex);
    return entries[targetIndex].path;
  }, [entries, currentIndex]);

  // Jump forward in history
  const jumpForward = useCallback((): string | null => {
    if (currentIndex === -1) return null; // Already at head
    if (currentIndex >= entries.length - 1) return null;

    const targetIndex = currentIndex + 1;

    // If jumping to the last entry, reset to head state
    if (targetIndex === entries.length - 1) {
      setCurrentIndex(-1);
    } else {
      setCurrentIndex(targetIndex);
    }

    return entries[targetIndex].path;
  }, [entries, currentIndex]);

  const canJumpBack =
    entries.length > 1 && (currentIndex === -1 || currentIndex > 0);
  const canJumpForward =
    currentIndex !== -1 && currentIndex < entries.length - 1;

  const setIsJumplistNavigation = useCallback((value: boolean) => {
    isJumplistNavigationRef.current = value;
  }, []);

  // Subscribe to router navigation events
  useEffect(() => {
    const unsubscribe = router.subscribe("onResolved", ({ toLocation }) => {
      // Don't record jumplist traversal
      if (isJumplistNavigationRef.current) {
        isJumplistNavigationRef.current = false;
        return;
      }

      const displayName = getDisplayNameFromPath(toLocation.pathname);
      pushEntry(toLocation.pathname, displayName);
    });

    return unsubscribe;
  }, [router, pushEntry]);

  return (
    <HistoryContext.Provider
      value={{
        entries,
        currentIndex,
        jumpBack,
        jumpForward,
        canJumpBack,
        canJumpForward,
        setIsJumplistNavigation,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export function useHistory(): HistoryContextValue {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
}

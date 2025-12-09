import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { FC, ReactNode } from "react";

// Types
export type ActivePane = "left" | "right";

interface PaneState {
  isPreviewOpen: boolean;
  activePane: ActivePane;
  previewUrl?: string;
}

interface PaneContextValue extends PaneState {
  openPreview: (url?: string) => void;
  closePreview: () => void;
  setActivePane: (pane: ActivePane) => void;
  // Leader key state for Ctrl+a sequences
  leaderActive: boolean;
}

const PaneContext = createContext<PaneContextValue | null>(null);

interface PaneProviderProps {
  children: ReactNode;
}

const LEADER_TIMEOUT_MS = 500;

export const PaneProvider: FC<PaneProviderProps> = ({ children }) => {
  // Pane state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activePane, setActivePaneInternal] = useState<ActivePane>("left");
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  // Leader key state
  const [leaderActive, setLeaderActive] = useState(false);
  const leaderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Open preview pane
  const openPreview = useCallback((url?: string) => {
    setPreviewUrl(url);
    setIsPreviewOpen(true);
    setActivePaneInternal("right"); // Focus preview pane when opening
  }, []);

  // Close preview pane
  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setActivePaneInternal("left"); // Always return focus to content
    setPreviewUrl(undefined);
  }, []);

  // Set active pane (only if preview is open)
  const setActivePane = useCallback(
    (pane: ActivePane) => {
      if (pane === "right" && !isPreviewOpen) {
        return; // Can't focus right pane if not open
      }
      setActivePaneInternal(pane);
    },
    [isPreviewOpen],
  );

  // Leader key activation helper
  const activateLeader = useCallback(() => {
    // Clear any existing timeout
    if (leaderTimeoutRef.current) {
      clearTimeout(leaderTimeoutRef.current);
    }

    setLeaderActive(true);

    // Auto-reset after timeout
    leaderTimeoutRef.current = setTimeout(() => {
      setLeaderActive(false);
      leaderTimeoutRef.current = null;
    }, LEADER_TIMEOUT_MS);
  }, []);

  // Handle Ctrl+a leader key and pane navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is in an actual input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl+a activates leader mode
      if (e.ctrlKey && e.key === "a") {
        e.preventDefault();
        activateLeader();
        return;
      }

      // Handle leader key sequences
      if (leaderActive) {
        // Clear timeout since we got a follow-up key
        if (leaderTimeoutRef.current) {
          clearTimeout(leaderTimeoutRef.current);
          leaderTimeoutRef.current = null;
        }

        switch (e.key) {
          case "l":
            e.preventDefault();
            setActivePane("right");
            break;
          case "h":
            e.preventDefault();
            setActivePane("left");
            break;
          case "x":
            // Only close preview when right pane is active
            if (activePane === "right") {
              e.preventDefault();
              closePreview();
            }
            break;
        }

        // Always clear leader after handling a key
        setLeaderActive(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      // Clean up timeout on unmount
      if (leaderTimeoutRef.current) {
        clearTimeout(leaderTimeoutRef.current);
      }
    };
  }, [leaderActive, activateLeader, setActivePane, closePreview, activePane]);

  const value: PaneContextValue = {
    isPreviewOpen,
    activePane,
    previewUrl,
    openPreview,
    closePreview,
    setActivePane,
    leaderActive,
  };

  return <PaneContext.Provider value={value}>{children}</PaneContext.Provider>;
};

export function usePane(): PaneContextValue {
  const context = useContext(PaneContext);
  if (!context) {
    throw new Error("usePane must be used within a PaneProvider");
  }
  return context;
}

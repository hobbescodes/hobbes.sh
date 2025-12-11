import { useNavigate, useRouter } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { FC, ReactNode } from "react";

const MAX_BUFFERS = 15;

export interface Buffer {
  id: number;
  path: string;
  displayName: string;
  openedAt: number;
}

interface BufferContextValue {
  // State
  buffers: Buffer[];
  currentBufferId: number | null;
  alternateBufferId: number | null;

  // Derived
  currentBuffer: Buffer | null;
  alternateBuffer: Buffer | null;

  // Actions
  switchToBuffer: (id: number) => void;
  switchToBufferByNumber: (n: number) => void;
  switchToBufferByQuery: (query: string) => void;
  switchToAlternate: () => void;
  removeBuffer: (id: number) => void;
  removeCurrentBuffer: () => void;
  getBufferByPath: (path: string) => Buffer | undefined;
  getBufferByNumber: (n: number) => Buffer | undefined;
}

const BufferContext = createContext<BufferContextValue | null>(null);

/**
 * Get display name for a path (e.g., "/about" -> "about.md")
 */
function getDisplayNameFromPath(pathname: string): string {
  if (pathname === "/") return "home.md";

  const parts = pathname.slice(1).split("/");
  const lastPart = parts[parts.length - 1];

  // Check if it's a directory-style route
  if (pathname === "/projects" || pathname === "/blog") {
    return `${lastPart}/`;
  }

  return `${lastPart}.md`;
}

interface BufferProviderProps {
  children: ReactNode;
}

export const BufferProvider: FC<BufferProviderProps> = ({ children }) => {
  const router = useRouter();
  const navigate = useNavigate();

  // Buffer state - session only, no persistence
  const [buffers, setBuffers] = useState<Buffer[]>([]);
  const [currentBufferId, setCurrentBufferId] = useState<number | null>(null);
  const [alternateBufferId, setAlternateBufferId] = useState<number | null>(
    null,
  );

  // Counter for unique buffer IDs
  const nextIdRef = useRef(1);

  // Flag to prevent recording buffer switches triggered by our own navigation
  const isInternalNavigationRef = useRef(false);

  // Derived state
  const currentBuffer = useMemo(
    () => buffers.find((b) => b.id === currentBufferId) ?? null,
    [buffers, currentBufferId],
  );

  const alternateBuffer = useMemo(
    () => buffers.find((b) => b.id === alternateBufferId) ?? null,
    [buffers, alternateBufferId],
  );

  // Get buffer by path
  const getBufferByPath = useCallback(
    (path: string): Buffer | undefined => {
      return buffers.find((b) => b.path === path);
    },
    [buffers],
  );

  // Get buffer by display number (1-indexed)
  const getBufferByNumber = useCallback(
    (n: number): Buffer | undefined => {
      return buffers[n - 1];
    },
    [buffers],
  );

  // Switch to a buffer by ID
  const switchToBuffer = useCallback(
    (id: number) => {
      const buffer = buffers.find((b) => b.id === id);
      if (!buffer) return;

      // If switching to a different buffer, navigate to it
      if (id !== currentBufferId) {
        isInternalNavigationRef.current = true;
        navigate({ to: buffer.path as "/" });
      }
    },
    [buffers, currentBufferId, navigate],
  );

  // Switch to buffer by display number (1-indexed)
  const switchToBufferByNumber = useCallback(
    (n: number) => {
      const buffer = getBufferByNumber(n);
      if (buffer) {
        switchToBuffer(buffer.id);
      }
    },
    [getBufferByNumber, switchToBuffer],
  );

  // Switch to buffer by fuzzy query match
  const switchToBufferByQuery = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      const match = buffers.find(
        (b) =>
          b.displayName.toLowerCase().includes(lowerQuery) ||
          b.path.toLowerCase().includes(lowerQuery),
      );
      if (match) {
        switchToBuffer(match.id);
      }
    },
    [buffers, switchToBuffer],
  );

  // Switch to alternate buffer
  const switchToAlternate = useCallback(() => {
    if (alternateBufferId !== null) {
      switchToBuffer(alternateBufferId);
    }
  }, [alternateBufferId, switchToBuffer]);

  // Remove a buffer by ID
  const removeBuffer = useCallback(
    (id: number) => {
      setBuffers((prev) => {
        const index = prev.findIndex((b) => b.id === id);
        if (index === -1) return prev;

        const newBuffers = prev.filter((b) => b.id !== id);

        // If removing current buffer, navigate to alternate or first available
        if (id === currentBufferId) {
          const nextBuffer =
            prev.find((b) => b.id === alternateBufferId) ?? newBuffers[0];

          if (nextBuffer) {
            // Schedule navigation after state update
            setTimeout(() => {
              isInternalNavigationRef.current = true;
              navigate({ to: nextBuffer.path as "/" });
            }, 0);
          } else {
            // No buffers left, navigate home
            setTimeout(() => {
              isInternalNavigationRef.current = true;
              navigate({ to: "/" });
            }, 0);
          }
        }

        // If removing alternate buffer, find new alternate
        if (id === alternateBufferId) {
          // Find the most recent buffer that isn't current
          const newAlternate = newBuffers
            .filter((b) => b.id !== currentBufferId)
            .sort((a, b) => b.openedAt - a.openedAt)[0];
          setAlternateBufferId(newAlternate?.id ?? null);
        }

        return newBuffers;
      });
    },
    [currentBufferId, alternateBufferId, navigate],
  );

  // Remove current buffer
  const removeCurrentBuffer = useCallback(() => {
    if (currentBufferId !== null) {
      removeBuffer(currentBufferId);
    }
  }, [currentBufferId, removeBuffer]);

  // Remove all buffers
  const removeAllBuffers = useCallback(() => {
    setBuffers([]);
    setCurrentBufferId(null);
    setAlternateBufferId(null);
    // Navigate home after clearing all buffers
    isInternalNavigationRef.current = true;
    navigate({ to: "/" });
  }, [navigate]);

  // Subscribe to router navigation events
  useEffect(() => {
    const unsubscribe = router.subscribe("onResolved", ({ toLocation }) => {
      // Skip if this was our own navigation
      if (isInternalNavigationRef.current) {
        isInternalNavigationRef.current = false;

        // Still need to update current/alternate IDs for internal navigation
        const existingBuffer = buffers.find(
          (b) => b.path === toLocation.pathname,
        );
        if (existingBuffer && existingBuffer.id !== currentBufferId) {
          setAlternateBufferId(currentBufferId);
          setCurrentBufferId(existingBuffer.id);
        }
        return;
      }

      const path = toLocation.pathname;
      const existingBuffer = buffers.find((b) => b.path === path);

      if (existingBuffer) {
        // Buffer already exists, just switch to it
        if (existingBuffer.id !== currentBufferId) {
          setAlternateBufferId(currentBufferId);
          setCurrentBufferId(existingBuffer.id);
        }
      } else {
        // Create new buffer
        const newBuffer: Buffer = {
          id: nextIdRef.current++,
          path,
          displayName: getDisplayNameFromPath(path),
          openedAt: Date.now(),
        };

        setBuffers((prev) => {
          let newBuffers = [...prev, newBuffer];

          // Enforce max buffers limit - remove oldest
          if (newBuffers.length > MAX_BUFFERS) {
            // Sort by openedAt to find oldest, but don't remove current or alternate
            const removable = newBuffers
              .filter(
                (b) => b.id !== currentBufferId && b.id !== alternateBufferId,
              )
              .sort((a, b) => a.openedAt - b.openedAt);

            if (removable.length > 0) {
              const toRemove = removable[0];
              newBuffers = newBuffers.filter((b) => b.id !== toRemove.id);
            }
          }

          return newBuffers;
        });

        setAlternateBufferId(currentBufferId);
        setCurrentBufferId(newBuffer.id);
      }
    });

    return unsubscribe;
  }, [router, buffers, currentBufferId, alternateBufferId]);

  // Listen for buffer events from NavigationContext
  useEffect(() => {
    const handleBufferSwitch = (
      e: CustomEvent<{ number?: number; query?: string }>,
    ) => {
      if (e.detail.number !== undefined) {
        switchToBufferByNumber(e.detail.number);
      } else if (e.detail.query !== undefined) {
        switchToBufferByQuery(e.detail.query);
      }
    };

    const handleBufferDelete = (e: CustomEvent<{ number?: number }>) => {
      if (e.detail.number !== undefined) {
        const buffer = getBufferByNumber(e.detail.number);
        if (buffer) {
          removeBuffer(buffer.id);
        }
      } else {
        removeCurrentBuffer();
      }
    };

    const handleBufferSwitchAlternate = () => {
      switchToAlternate();
    };

    const handleBufferDeleteAll = () => {
      removeAllBuffers();
    };

    window.addEventListener(
      "buffer-switch",
      handleBufferSwitch as EventListener,
    );
    window.addEventListener(
      "buffer-delete",
      handleBufferDelete as EventListener,
    );
    window.addEventListener(
      "buffer-switch-alternate",
      handleBufferSwitchAlternate,
    );
    window.addEventListener("buffer-delete-all", handleBufferDeleteAll);

    return () => {
      window.removeEventListener(
        "buffer-switch",
        handleBufferSwitch as EventListener,
      );
      window.removeEventListener(
        "buffer-delete",
        handleBufferDelete as EventListener,
      );
      window.removeEventListener(
        "buffer-switch-alternate",
        handleBufferSwitchAlternate,
      );
      window.removeEventListener("buffer-delete-all", handleBufferDeleteAll);
    };
  }, [
    switchToBufferByNumber,
    switchToBufferByQuery,
    switchToAlternate,
    removeBuffer,
    removeCurrentBuffer,
    removeAllBuffers,
    getBufferByNumber,
  ]);

  const value: BufferContextValue = {
    buffers,
    currentBufferId,
    alternateBufferId,
    currentBuffer,
    alternateBuffer,
    switchToBuffer,
    switchToBufferByNumber,
    switchToBufferByQuery,
    switchToAlternate,
    removeBuffer,
    removeCurrentBuffer,
    getBufferByPath,
    getBufferByNumber,
  };

  return (
    <BufferContext.Provider value={value}>{children}</BufferContext.Provider>
  );
};

export function useBuffers(): BufferContextValue {
  const context = useContext(BufferContext);
  if (!context) {
    throw new Error("useBuffers must be used within a BufferProvider");
  }
  return context;
}

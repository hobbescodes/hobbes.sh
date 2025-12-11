import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { FC, ReactNode } from "react";

const MARKS_STORAGE_KEY = "hobbescodes-marks";

export interface Mark {
  path: string;
  displayName: string;
  createdAt: string;
}

export type MarksRecord = Record<string, Mark>;

interface MarksContextValue {
  /** All marks (key is single letter a-z) */
  marks: MarksRecord;
  /** Set a mark at the given key */
  setMark: (key: string, path: string, displayName: string) => void;
  /** Get a mark by key */
  getMark: (key: string) => Mark | undefined;
  /** Delete a mark by key */
  deleteMark: (key: string) => void;
  /** Delete all marks */
  deleteAllMarks: () => void;
  /** Check if a mark exists */
  hasMark: (key: string) => boolean;
}

const MarksContext = createContext<MarksContextValue | null>(null);

/**
 * Validate that a key is a valid mark key (single lowercase letter a-z)
 */
function isValidMarkKey(key: string): boolean {
  return /^[a-z]$/.test(key);
}

/**
 * Load marks from localStorage
 */
function loadMarks(): MarksRecord {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(MARKS_STORAGE_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    // Validate structure
    if (typeof parsed !== "object" || parsed === null) return {};

    // Filter to only valid mark keys
    const validMarks: MarksRecord = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (
        isValidMarkKey(key) &&
        typeof value === "object" &&
        value !== null &&
        "path" in value &&
        "displayName" in value
      ) {
        validMarks[key] = value as Mark;
      }
    }
    return validMarks;
  } catch {
    return {};
  }
}

/**
 * Save marks to localStorage
 */
function saveMarks(marks: MarksRecord): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(MARKS_STORAGE_KEY, JSON.stringify(marks));
  } catch {
    // Ignore storage errors (e.g., quota exceeded)
  }
}

interface MarksProviderProps {
  children: ReactNode;
}

export const MarksProvider: FC<MarksProviderProps> = ({ children }) => {
  const [marks, setMarks] = useState<MarksRecord>({});

  // Load marks from localStorage on mount
  useEffect(() => {
    setMarks(loadMarks());
  }, []);

  const setMark = useCallback(
    (key: string, path: string, displayName: string) => {
      if (!isValidMarkKey(key)) return;

      const newMark: Mark = {
        path,
        displayName,
        createdAt: new Date().toISOString(),
      };

      setMarks((prev) => {
        const updated = { ...prev, [key]: newMark };
        saveMarks(updated);
        return updated;
      });
    },
    [],
  );

  const getMark = useCallback(
    (key: string): Mark | undefined => {
      if (!isValidMarkKey(key)) return undefined;
      return marks[key];
    },
    [marks],
  );

  const deleteMark = useCallback((key: string) => {
    if (!isValidMarkKey(key)) return;

    setMarks((prev) => {
      const updated = { ...prev };
      delete updated[key];
      saveMarks(updated);
      return updated;
    });
  }, []);

  const deleteAllMarks = useCallback(() => {
    setMarks({});
    saveMarks({});
  }, []);

  const hasMark = useCallback(
    (key: string): boolean => {
      if (!isValidMarkKey(key)) return false;
      return key in marks;
    },
    [marks],
  );

  return (
    <MarksContext
      value={{ marks, setMark, getMark, deleteMark, deleteAllMarks, hasMark }}
    >
      {children}
    </MarksContext>
  );
};

export function useMarks(): MarksContextValue {
  const context = useContext(MarksContext);
  if (!context) {
    throw new Error("useMarks must be used within a MarksProvider");
  }
  return context;
}

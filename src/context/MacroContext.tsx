import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { FC, ReactNode } from "react";

const MACROS_STORAGE_KEY = "hobbescodes-macros";
const MAX_MACRO_LENGTH = 100;
const MAX_REPLAY_DEPTH = 10;
const REPLAY_DELAY_MS = 30;

export interface RecordedKey {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

export interface Macro {
  keys: RecordedKey[];
  recordedAt: string; // ISO date
}

export type MacroRegister = string; // a-z

export type MacrosRecord = Record<MacroRegister, Macro>;

interface MacroContextValue {
  // State
  macros: MacrosRecord;
  isRecording: boolean;
  recordingRegister: MacroRegister | null;
  isReplaying: boolean;
  lastExecutedRegister: MacroRegister | null;

  // Actions
  startRecording: (register: MacroRegister) => void;
  stopRecording: () => void;
  recordKey: (event: KeyboardEvent) => void;
  replayMacro: (register: MacroRegister) => Promise<void>;
  replayLastMacro: () => Promise<void>;
  deleteMacro: (register: MacroRegister) => void;
  deleteAllMacros: () => void;

  // Derived
  getDisplayKeys: (register: MacroRegister) => string;
  getMacro: (register: MacroRegister) => Macro | undefined;
}

const MacroContext = createContext<MacroContextValue | null>(null);

// Load macros from localStorage
function loadMacros(): MacrosRecord {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(MACROS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load macros:", e);
  }
  return {};
}

// Save macros to localStorage
function saveMacros(macros: MacrosRecord): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MACROS_STORAGE_KEY, JSON.stringify(macros));
  } catch (e) {
    console.error("Failed to save macros:", e);
  }
}

// Convert recorded key to display string
function keyToDisplay(k: RecordedKey): string {
  let display = "";
  if (k.ctrlKey) display += "C-";
  if (k.metaKey) display += "M-";
  if (k.altKey) display += "A-";

  // Human-readable key names
  const keyName: Record<string, string> = {
    Enter: "⏎",
    Escape: "Esc",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
    " ": "␣",
    Backspace: "⌫",
    Tab: "⇥",
  };

  return display + (keyName[k.key] ?? k.key);
}

interface MacroProviderProps {
  children: ReactNode;
}

export const MacroProvider: FC<MacroProviderProps> = ({ children }) => {
  const [macros, setMacros] = useState<MacrosRecord>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingRegister, setRecordingRegister] =
    useState<MacroRegister | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [lastExecutedRegister, setLastExecutedRegister] =
    useState<MacroRegister | null>(null);

  // Current recording buffer
  const currentRecordingRef = useRef<RecordedKey[]>([]);

  // Track replay depth to prevent infinite recursion
  const replayDepthRef = useRef(0);

  // Load macros on mount
  useEffect(() => {
    setMacros(loadMacros());
  }, []);

  // Start recording to a register
  const startRecording = useCallback((register: MacroRegister) => {
    if (!/^[a-z]$/.test(register)) return;

    setIsRecording(true);
    setRecordingRegister(register);
    currentRecordingRef.current = [];
  }, []);

  // Stop recording and save
  const stopRecording = useCallback(() => {
    if (!isRecording || !recordingRegister) return;

    const recording = currentRecordingRef.current;

    // Only save if we recorded something
    if (recording.length > 0) {
      setMacros((prev) => {
        const updated = {
          ...prev,
          [recordingRegister]: {
            keys: recording,
            recordedAt: new Date().toISOString(),
          },
        };
        saveMacros(updated);
        return updated;
      });
    }

    setIsRecording(false);
    setRecordingRegister(null);
    currentRecordingRef.current = [];
  }, [isRecording, recordingRegister]);

  // Record a key event
  const recordKey = useCallback(
    (event: KeyboardEvent) => {
      if (!isRecording) return;
      if (currentRecordingRef.current.length >= MAX_MACRO_LENGTH) {
        // Auto-stop if max length reached
        stopRecording();
        return;
      }

      // Don't record macro keys themselves
      if (event.key === "q" || event.key === "@") return;
      // Don't record Escape (it cancels operations)
      if (event.key === "Escape") return;

      const recorded: RecordedKey = {
        key: event.key,
        ctrlKey: event.ctrlKey || undefined,
        metaKey: event.metaKey || undefined,
        altKey: event.altKey || undefined,
        shiftKey: event.shiftKey || undefined,
      };

      currentRecordingRef.current = [...currentRecordingRef.current, recorded];
    },
    [isRecording, stopRecording],
  );

  // Replay a macro
  const replayMacro = useCallback(
    async (register: MacroRegister) => {
      const macro = macros[register];
      if (!macro || macro.keys.length === 0) return;

      // Prevent infinite recursion
      if (replayDepthRef.current >= MAX_REPLAY_DEPTH) {
        console.warn("Max macro replay depth reached");
        return;
      }

      replayDepthRef.current++;
      setIsReplaying(true);
      setLastExecutedRegister(register);

      try {
        for (const recorded of macro.keys) {
          // Dispatch synthetic keyboard event
          const event = new KeyboardEvent("keydown", {
            key: recorded.key,
            ctrlKey: recorded.ctrlKey ?? false,
            metaKey: recorded.metaKey ?? false,
            altKey: recorded.altKey ?? false,
            shiftKey: recorded.shiftKey ?? false,
            bubbles: true,
          });

          window.dispatchEvent(event);

          // Small delay for visual feedback and to let handlers process
          await new Promise((resolve) => setTimeout(resolve, REPLAY_DELAY_MS));
        }
      } finally {
        replayDepthRef.current--;
        if (replayDepthRef.current === 0) {
          setIsReplaying(false);
        }
      }
    },
    [macros],
  );

  // Replay last executed macro
  const replayLastMacro = useCallback(async () => {
    if (!lastExecutedRegister) return;
    await replayMacro(lastExecutedRegister);
  }, [lastExecutedRegister, replayMacro]);

  // Delete a macro
  const deleteMacro = useCallback((register: MacroRegister) => {
    setMacros((prev) => {
      const updated = { ...prev };
      delete updated[register];
      saveMacros(updated);
      return updated;
    });
  }, []);

  // Delete all macros
  const deleteAllMacros = useCallback(() => {
    setMacros({});
    saveMacros({});
    setLastExecutedRegister(null);
  }, []);

  // Get display string for a macro's keys
  const getDisplayKeys = useCallback(
    (register: MacroRegister): string => {
      const macro = macros[register];
      if (!macro) return "";

      return macro.keys.map(keyToDisplay).join(" ");
    },
    [macros],
  );

  // Get a macro by register
  const getMacro = useCallback(
    (register: MacroRegister): Macro | undefined => {
      return macros[register];
    },
    [macros],
  );

  const value: MacroContextValue = {
    macros,
    isRecording,
    recordingRegister,
    isReplaying,
    lastExecutedRegister,
    startRecording,
    stopRecording,
    recordKey,
    replayMacro,
    replayLastMacro,
    deleteMacro,
    deleteAllMacros,
    getDisplayKeys,
    getMacro,
  };

  return (
    <MacroContext.Provider value={value}>{children}</MacroContext.Provider>
  );
};

export function useMacros(): MacroContextValue {
  const context = useContext(MacroContext);
  if (!context) {
    throw new Error("useMacros must be used within a MacroProvider");
  }
  return context;
}

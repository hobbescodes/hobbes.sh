import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getAllRoutes, searchRoutes } from "@/lib/routes";

import type { FC, ReactNode } from "react";
import type { SearchableRoute } from "@/lib/routes";
import type { Colorscheme } from "@/types";

// Valid colorscheme names and aliases
const COLORSCHEME_ALIASES: Record<string, Colorscheme> = {
  ghostty: "ghostty",
  ghost: "ghostty",
  "👻": "ghostty",
  mocha: "mocha",
  macchiato: "macchiato",
  frappe: "frappe",
  frappé: "frappe",
  latte: "latte",
};

// Types
export type NavigationMode = "NORMAL" | "COMMAND" | "SEARCH" | "GAME";

export interface SearchResult {
  path: string;
  displayName: string;
  type: "file" | "directory";
  matchType: "route" | "content";
  snippet?: string;
  title?: string;
  tags?: string[];
  date?: string;
  readingTime?: string;
}

interface NavigationContextValue {
  // Mode management
  mode: NavigationMode;
  setMode: (mode: NavigationMode) => void;

  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  selectedSearchIndex: number;
  setSelectedSearchIndex: (index: number) => void;

  // Command state
  commandBuffer: string;
  setCommandBuffer: (cmd: string) => void;
  commandError: string | null;
  setCommandError: (error: string | null) => void;
  executeCommand: () => void;

  // Count buffer for vim-style count prefix (e.g., "5j" to move 5 lines)
  countBuffer: string;
  setCountBuffer: (count: string) => void;
  getCount: () => number;

  // Pending operator for multi-key commands (e.g., "gx")
  pendingOperator: string | null;
  setPendingOperator: (op: string | null) => void;

  // Help overlay
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;

  // Colorscheme overlay
  showColorscheme: boolean;
  setShowColorscheme: (show: boolean) => void;

  // Marks overlay
  showMarks: boolean;
  setShowMarks: (show: boolean) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: FC<NavigationProviderProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode state
  const [mode, setModeInternal] = useState<NavigationMode>("NORMAL");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);

  // Derive search results from query - no need for state + effect
  const searchResults = useMemo((): SearchResult[] => {
    if (mode !== "SEARCH" || !searchQuery.trim()) {
      return [];
    }

    const allRoutes = getAllRoutes();
    const lowerQuery = searchQuery.toLowerCase();

    return allRoutes
      .filter((route: SearchableRoute) => {
        // Match against display name
        if (route.displayName.toLowerCase().includes(lowerQuery)) return true;
        // Match against path
        if (route.path.toLowerCase().includes(lowerQuery)) return true;
        // Match against title if available
        if (route.title?.toLowerCase().includes(lowerQuery)) return true;
        // Match against description if available
        if (route.description?.toLowerCase().includes(lowerQuery)) return true;
        // Match against tags if available
        if (route.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)))
          return true;
        return false;
      })
      .map((route: SearchableRoute) => ({
        path: route.path,
        displayName: route.displayName,
        type: route.type,
        matchType: "route" as const,
        snippet: route.description || route.title,
        title: route.title,
        tags: route.tags,
        date: route.date,
        readingTime: route.readingTime,
      }));
  }, [mode, searchQuery]);

  // Keep selected index in bounds when results change
  const clampedSelectedSearchIndex = Math.min(
    selectedSearchIndex,
    Math.max(0, searchResults.length - 1),
  );

  // Command state
  const [commandBuffer, setCommandBuffer] = useState("");
  const [commandError, setCommandError] = useState<string | null>(null);

  // Help overlay
  const [showHelp, setShowHelp] = useState(false);

  // Colorscheme overlay
  const [showColorscheme, setShowColorscheme] = useState(false);

  // Marks overlay
  const [showMarks, setShowMarks] = useState(false);

  // Count buffer for vim-style count prefix (e.g., "5j" to move 5 lines)
  const [countBuffer, setCountBuffer] = useState("");

  // Pending operator for multi-key commands (e.g., "gx")
  const [pendingOperator, setPendingOperator] = useState<string | null>(null);
  const pendingOperatorTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Get the count value (defaults to 1 if no count specified)
  const getCount = useCallback(() => {
    const count = parseInt(countBuffer, 10);
    return Number.isNaN(count) || count < 1 ? 1 : count;
  }, [countBuffer]);

  // Set mode with cleanup
  const setMode = useCallback((newMode: NavigationMode) => {
    setModeInternal(newMode);
    setCountBuffer(""); // Always clear count buffer on mode change
    if (newMode === "NORMAL") {
      setSearchQuery("");
      setSelectedSearchIndex(0);
      setCommandBuffer("");
      setCommandError(null);
    } else if (newMode === "SEARCH") {
      setCommandBuffer("");
      setCommandError(null);
    } else if (newMode === "COMMAND") {
      setSearchQuery("");
      setSelectedSearchIndex(0);
    }
  }, []);

  // Execute command
  const executeCommand = useCallback(() => {
    const cmd = commandBuffer.trim();
    const cmdLower = cmd.toLowerCase();

    if (cmdLower === "q") {
      navigate({ to: "/", search: {} });
      setMode("NORMAL");
    } else if (cmdLower === "help" || cmdLower === "h") {
      setMode("NORMAL");
      setShowHelp(true);
    } else if (cmdLower === "") {
      setMode("NORMAL");
    } else if (cmdLower.startsWith("e ") || cmdLower.startsWith("edit ")) {
      // Parse :e <path> or :edit <path>
      const pathArg = cmd.replace(/^(e|edit)\s+/i, "").trim();

      if (!pathArg) {
        setCommandError("E32: No file name");
        return;
      }

      // Normalize the path
      let targetPath = pathArg;
      // Remove common prefixes like ~/ or ~/hobbescodes/
      targetPath = targetPath
        .replace(/^~\/?/, "")
        .replace(/^hobbescodes\/?/, "");
      // Remove .md extension if present
      targetPath = targetPath.replace(/\.md$/, "");
      // Ensure leading slash
      if (!targetPath.startsWith("/")) {
        targetPath = `/${targetPath}`;
      }
      // Remove trailing slash for files
      if (targetPath !== "/" && targetPath.endsWith("/")) {
        targetPath = targetPath.slice(0, -1);
      }

      // Try exact match first
      const allRoutes = getAllRoutes();
      let match = allRoutes.find((r) => r.path === targetPath);

      // Try fuzzy search if no exact match
      if (!match) {
        const searchResults = searchRoutes(pathArg);
        if (searchResults.length === 1) {
          match = searchResults[0];
        } else if (searchResults.length > 1) {
          // If multiple matches, try to find exact displayName match
          match = searchResults.find(
            (r) =>
              r.displayName.replace(/\.md$/, "").toLowerCase() ===
              pathArg.toLowerCase(),
          );
          // Fall back to first result if no exact match
          if (!match) {
            match = searchResults[0];
          }
        }
      }

      if (match) {
        // Use type assertion since we know these are valid routes
        navigate({ to: match.path as "/", search: {} });
        setMode("NORMAL");
      } else {
        setCommandError(`E32: Can't find file "${pathArg}"`);
      }
    } else if (cmdLower === "sane") {
      // :sane sets to ghostty (default dark)
      window.dispatchEvent(
        new CustomEvent("colorscheme-set", { detail: "ghostty" }),
      );
      setMode("NORMAL");
    } else if (cmdLower === "insane") {
      // :insane sets to latte (light)
      window.dispatchEvent(
        new CustomEvent("colorscheme-set", { detail: "latte" }),
      );
      setMode("NORMAL");
    } else if (cmdLower === "theme" || cmdLower === "themes") {
      // :theme with no args opens the picker
      setMode("NORMAL");
      setShowColorscheme(true);
    } else if (
      cmdLower.startsWith("theme ") ||
      cmdLower.startsWith("themes ")
    ) {
      // :theme <name> sets the colorscheme
      const colorArg = cmd
        .replace(/^themes?\s+/i, "")
        .trim()
        .toLowerCase();

      const colorscheme = COLORSCHEME_ALIASES[colorArg];
      if (colorscheme) {
        window.dispatchEvent(
          new CustomEvent("colorscheme-set", { detail: colorscheme }),
        );
        setMode("NORMAL");
      } else {
        setCommandError(`E185: Cannot find colorscheme "${colorArg}"`);
      }
    } else if (cmdLower === "snake") {
      navigate({ to: "/game/snake", search: {} });
      setMode("NORMAL");
    } else if (cmdLower === "marks") {
      // :marks opens the marks overlay
      setMode("NORMAL");
      setShowMarks(true);
    } else if (cmdLower === "delmarks!") {
      // :delmarks! deletes all marks
      window.dispatchEvent(new CustomEvent("marks-delete-all"));
      setMode("NORMAL");
    } else if (cmdLower.startsWith("delmarks ")) {
      // :delmarks {letter} deletes a specific mark
      const markKey = cmd
        .replace(/^delmarks\s+/i, "")
        .trim()
        .toLowerCase();
      if (/^[a-z]$/.test(markKey)) {
        window.dispatchEvent(
          new CustomEvent("mark-delete", { detail: { key: markKey } }),
        );
        setMode("NORMAL");
      } else {
        setCommandError(`E474: Invalid argument: ${markKey}`);
      }
    } else {
      setCommandError(`Unknown command: ${cmd}`);
    }
  }, [commandBuffer, navigate, setMode]);

  // Global keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is in an actual input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Handle based on current mode
      if (mode === "NORMAL") {
        // Handle pending operator (e.g., 'g' waiting for 'x', 'm' waiting for mark letter)
        if (pendingOperator === "g") {
          e.preventDefault();
          // Clear the timeout since we got a follow-up key
          if (pendingOperatorTimeoutRef.current) {
            clearTimeout(pendingOperatorTimeoutRef.current);
            pendingOperatorTimeoutRef.current = null;
          }

          if (e.key === "x") {
            // Dispatch gx event for pages to handle
            window.dispatchEvent(new CustomEvent("gx-execute"));
          }
          // Clear pending operator regardless of which key was pressed
          setPendingOperator(null);
          return;
        }

        // Handle 'm' pending operator for setting marks
        if (pendingOperator === "m") {
          e.preventDefault();
          if (pendingOperatorTimeoutRef.current) {
            clearTimeout(pendingOperatorTimeoutRef.current);
            pendingOperatorTimeoutRef.current = null;
          }

          // Check if it's a valid mark key (a-z)
          if (/^[a-z]$/.test(e.key)) {
            window.dispatchEvent(
              new CustomEvent("mark-set", { detail: { key: e.key } }),
            );
          }
          setPendingOperator(null);
          return;
        }

        // Handle "'" pending operator for jumping to marks
        if (pendingOperator === "'") {
          e.preventDefault();
          if (pendingOperatorTimeoutRef.current) {
            clearTimeout(pendingOperatorTimeoutRef.current);
            pendingOperatorTimeoutRef.current = null;
          }

          // Check if it's a valid mark key (a-z)
          if (/^[a-z]$/.test(e.key)) {
            window.dispatchEvent(
              new CustomEvent("mark-jump", { detail: { key: e.key } }),
            );
          }
          setPendingOperator(null);
          return;
        }

        // Handle Ctrl+D and Ctrl+U for half-page scrolling
        if (e.ctrlKey && (e.key === "d" || e.key === "u")) {
          e.preventDefault();
          setCountBuffer(""); // Clear count on scroll
          // Find the scrollable buffer container
          const scrollContainer = document.querySelector(".overflow-auto");
          if (scrollContainer) {
            const lineHeight = 22.4; // 1.6 line-height * ~14px base font
            const halfPageLines = Math.floor(
              scrollContainer.clientHeight / lineHeight / 2,
            );
            const scrollAmount = scrollContainer.clientHeight / 2;

            scrollContainer.scrollBy({
              top: e.key === "d" ? scrollAmount : -scrollAmount,
              behavior: "smooth",
            });

            // Dispatch event for useBufferNavigation to update currentLine
            window.dispatchEvent(
              new CustomEvent("scroll-half-page", {
                detail: {
                  direction: e.key === "d" ? "down" : "up",
                  lines: halfPageLines,
                },
              }),
            );
          }
          return;
        }

        // Handle digit keys for count buffer (vim-style count prefix)
        if (e.key >= "0" && e.key <= "9") {
          // Don't capture '0' if count buffer is empty (0 alone could be future "go to start")
          if (e.key === "0" && countBuffer === "") {
            return;
          }
          e.preventDefault();
          setCountBuffer((prev) => prev + e.key);
          return;
        }

        switch (e.key) {
          case "g":
          case "m":
          case "'":
            e.preventDefault();
            setCountBuffer(""); // Clear count when starting pending operator
            setPendingOperator(e.key);
            // Set timeout to clear pending operator after 800ms
            pendingOperatorTimeoutRef.current = setTimeout(() => {
              setPendingOperator(null);
              pendingOperatorTimeoutRef.current = null;
            }, 800);
            break;
          case ":":
            e.preventDefault();
            setCountBuffer(""); // Clear count when entering command mode
            setMode("COMMAND");
            break;
          case "/":
            e.preventDefault();
            setCountBuffer(""); // Clear count when entering search mode
            setMode("SEARCH");
            break;
          case "?":
            e.preventDefault();
            setCountBuffer("");
            setShowHelp((prev) => !prev);
            break;
          case "Escape":
            e.preventDefault();
            setCountBuffer(""); // Clear count on escape
            setPendingOperator(null); // Clear pending operator on escape
            if (pendingOperatorTimeoutRef.current) {
              clearTimeout(pendingOperatorTimeoutRef.current);
              pendingOperatorTimeoutRef.current = null;
            }
            setShowHelp(false);
            break;
          case "Backspace":
            // Handle backspace when in count buffer mode
            if (countBuffer.length > 0) {
              e.preventDefault();
              setCountBuffer((prev) => prev.slice(0, -1));
            }
            break;
        }
      } else if (mode === "COMMAND") {
        switch (e.key) {
          case "Escape":
            e.preventDefault();
            setMode("NORMAL");
            break;
          case "Enter":
            e.preventDefault();
            executeCommand();
            break;
          case "Backspace":
            e.preventDefault();
            // Clear error on any keypress
            if (commandError) {
              setCommandError(null);
              setCommandBuffer("");
            } else {
              setCommandBuffer((prev) => prev.slice(0, -1));
            }
            break;
          default:
            // Only handle printable characters
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
              e.preventDefault();
              // Clear error on any keypress
              if (commandError) {
                setCommandError(null);
                // If user types `:` after error, start fresh (`:` is the prompt, not part of command)
                setCommandBuffer(e.key === ":" ? "" : e.key);
              } else {
                setCommandBuffer((prev) => prev + e.key);
              }
            }
            break;
        }
      } else if (mode === "SEARCH") {
        switch (e.key) {
          case "Escape":
            e.preventDefault();
            setMode("NORMAL");
            break;
          case "Enter":
            e.preventDefault();
            if (
              searchResults.length > 0 &&
              searchResults[clampedSelectedSearchIndex]
            ) {
              navigate({
                to: searchResults[clampedSelectedSearchIndex].path as "/",
                search: {},
              });
              setMode("NORMAL");
            }
            break;
          case "ArrowDown":
            // In telescope-style (reversed list), down moves toward bottom (lower index)
            e.preventDefault();
            setSelectedSearchIndex((prev) => Math.max(prev - 1, 0));
            break;
          case "ArrowUp":
            // In telescope-style (reversed list), up moves toward top (higher index)
            e.preventDefault();
            setSelectedSearchIndex((prev) =>
              Math.min(prev + 1, searchResults.length - 1),
            );
            break;
          case "Backspace":
            e.preventDefault();
            setSearchQuery((prev) => prev.slice(0, -1));
            break;
          default:
            // Only handle printable characters
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
              e.preventDefault();
              setSearchQuery((prev) => prev + e.key);
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      // Clean up pending operator timeout on unmount
      if (pendingOperatorTimeoutRef.current) {
        clearTimeout(pendingOperatorTimeoutRef.current);
      }
    };
  }, [
    mode,
    setMode,
    executeCommand,
    commandError,
    searchResults,
    clampedSelectedSearchIndex,
    navigate,
    countBuffer,
    pendingOperator,
  ]);

  // Reset mode when route changes (except for game routes which manage their own mode)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run on route change only
  useEffect(() => {
    // Don't reset mode for game routes - they manage their own mode
    if (location.pathname.startsWith("/game/")) {
      return;
    }
    setMode("NORMAL");
    setShowHelp(false);
    setShowColorscheme(false);
    setShowMarks(false);
  }, [location.pathname]);

  const value: NavigationContextValue = {
    mode,
    setMode,
    searchQuery,
    setSearchQuery,
    searchResults,
    selectedSearchIndex: clampedSelectedSearchIndex,
    setSelectedSearchIndex,
    commandBuffer,
    setCommandBuffer,
    commandError,
    setCommandError,
    executeCommand,
    countBuffer,
    setCountBuffer,
    getCount,
    pendingOperator,
    setPendingOperator,
    showHelp,
    setShowHelp,
    showColorscheme,
    setShowColorscheme,
    showMarks,
    setShowMarks,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}

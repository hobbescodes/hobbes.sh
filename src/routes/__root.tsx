import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { NotFound } from "@/components/NotFound";
import { BufferProvider } from "@/context/BufferContext";
import { HistoryProvider, useHistory } from "@/context/HistoryContext";
import { MacroProvider, useMacros } from "@/context/MacroContext";
import { MarksProvider, useMarks } from "@/context/MarksContext";
import { NavigationProvider, useNavigation } from "@/context/NavigationContext";
import { PaneProvider } from "@/context/PaneContext";
import ThemeProvider from "@/context/ThemeContext";
import { seo } from "@/lib/seo";
import { getColorscheme } from "@/server/functions/theme";
import appCss from "@/styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const colorscheme = await getColorscheme();
    return { colorscheme };
  },
  notFoundComponent: NotFound,
  head: () => {
    const { meta, links } = seo({ title: "hobbescodes", url: "/" });
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        ...meta,
      ],
      links: [
        {
          rel: "preload",
          href: "/wallpaper.webp",
          as: "image",
          type: "image/webp",
        },
        { rel: "stylesheet", href: appCss },
        ...links,
      ],
    };
  },

  component: RootComponent,
});

/**
 * Component that handles mark-related custom events from NavigationContext
 * Must be inside MarksProvider and NavigationProvider
 */
function MarkEventsHandler() {
  const { setMark, getMark, deleteMark, deleteAllMarks } = useMarks();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle mark-set event (m{a-z})
    const handleMarkSet = (e: CustomEvent<{ key: string }>) => {
      const { key } = e.detail;
      // Get display name from pathname
      const displayName = getDisplayNameFromPath(location.pathname);
      setMark(key, location.pathname, displayName);
    };

    // Handle mark-jump event ('{a-z})
    const handleMarkJump = (e: CustomEvent<{ key: string }>) => {
      const { key } = e.detail;
      const mark = getMark(key);
      if (mark) {
        navigate({ to: mark.path as "/", search: {} });
      }
    };

    // Handle mark-delete event (:delmarks {letter})
    const handleMarkDelete = (e: CustomEvent<{ key: string }>) => {
      deleteMark(e.detail.key);
    };

    // Handle marks-delete-all event (:delmarks!)
    const handleMarksDeleteAll = () => {
      deleteAllMarks();
    };

    window.addEventListener("mark-set", handleMarkSet as EventListener);
    window.addEventListener("mark-jump", handleMarkJump as EventListener);
    window.addEventListener("mark-delete", handleMarkDelete as EventListener);
    window.addEventListener("marks-delete-all", handleMarksDeleteAll);

    return () => {
      window.removeEventListener("mark-set", handleMarkSet as EventListener);
      window.removeEventListener("mark-jump", handleMarkJump as EventListener);
      window.removeEventListener(
        "mark-delete",
        handleMarkDelete as EventListener,
      );
      window.removeEventListener("marks-delete-all", handleMarksDeleteAll);
    };
  }, [
    setMark,
    getMark,
    deleteMark,
    deleteAllMarks,
    navigate,
    location.pathname,
  ]);

  return null;
}

/**
 * Get display name for a path (e.g., "/about" -> "about.md")
 */
function getDisplayNameFromPath(pathname: string): string {
  if (pathname === "/") return "home.md";

  // Remove leading slash and determine type
  const parts = pathname.slice(1).split("/");
  const lastPart = parts[parts.length - 1];

  // Check if it's a directory-style route (ends with index)
  if (pathname === "/projects" || pathname === "/blog") {
    return `${lastPart}/`;
  }

  return `${lastPart}.md`;
}

/**
 * Component that handles history-related custom events from NavigationContext
 * Must be inside HistoryProvider
 */
function HistoryEventsHandler() {
  const { jumpBack, jumpForward, setIsJumplistNavigation } = useHistory();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle Ctrl+o (jump back)
    const handleJumpBack = () => {
      const targetPath = jumpBack();
      if (targetPath) {
        setIsJumplistNavigation(true);
        navigate({ to: targetPath as "/", search: {} });
      }
    };

    // Handle Ctrl+i (jump forward)
    const handleJumpForward = () => {
      const targetPath = jumpForward();
      if (targetPath) {
        setIsJumplistNavigation(true);
        navigate({ to: targetPath as "/", search: {} });
      }
    };

    window.addEventListener("history-jump-back", handleJumpBack);
    window.addEventListener("history-jump-forward", handleJumpForward);

    return () => {
      window.removeEventListener("history-jump-back", handleJumpBack);
      window.removeEventListener("history-jump-forward", handleJumpForward);
    };
  }, [jumpBack, jumpForward, setIsJumplistNavigation, navigate]);

  return null;
}

/**
 * Component that handles macro-related custom events from NavigationContext
 * Must be inside MacroProvider and NavigationProvider
 */
function MacroEventsHandler() {
  const {
    isRecording,
    startRecording,
    stopRecording,
    recordKey,
    replayMacro,
    replayLastMacro,
    deleteMacro,
    deleteAllMacros,
  } = useMacros();
  const { setPendingOperator, setShowWhichKey } = useNavigation();

  useEffect(() => {
    // Handle toggle recording (q key)
    const handleToggleRecording = () => {
      if (isRecording) {
        stopRecording();
        // Clear pending state since we just stopped recording
        setPendingOperator(null);
        setShowWhichKey(false);
      }
      // If not recording, the pending operator 'q' is already set,
      // and macro-start-recording will be dispatched when user presses a-z
    };

    // Handle start recording (q{a-z})
    const handleStartRecording = (e: CustomEvent<{ key: string }>) => {
      startRecording(e.detail.key);
    };

    // Handle replay macro (@{a-z})
    const handleReplayMacro = (e: CustomEvent<{ key: string }>) => {
      replayMacro(e.detail.key);
    };

    // Handle replay last macro (@@)
    const handleReplayLast = () => {
      replayLastMacro();
    };

    // Handle delete macro (:delreg {a-z})
    const handleDeleteMacro = (e: CustomEvent<{ key: string }>) => {
      deleteMacro(e.detail.key);
    };

    // Handle delete all macros (:delreg!)
    const handleDeleteAll = () => {
      deleteAllMacros();
    };

    // Record keystrokes while recording
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isRecording) {
        recordKey(e);
      }
    };

    window.addEventListener("macro-toggle-recording", handleToggleRecording);
    window.addEventListener(
      "macro-start-recording",
      handleStartRecording as EventListener,
    );
    window.addEventListener("macro-replay", handleReplayMacro as EventListener);
    window.addEventListener("macro-replay-last", handleReplayLast);
    window.addEventListener("macro-delete", handleDeleteMacro as EventListener);
    window.addEventListener("macro-delete-all", handleDeleteAll);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "macro-toggle-recording",
        handleToggleRecording,
      );
      window.removeEventListener(
        "macro-start-recording",
        handleStartRecording as EventListener,
      );
      window.removeEventListener(
        "macro-replay",
        handleReplayMacro as EventListener,
      );
      window.removeEventListener("macro-replay-last", handleReplayLast);
      window.removeEventListener(
        "macro-delete",
        handleDeleteMacro as EventListener,
      );
      window.removeEventListener("macro-delete-all", handleDeleteAll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isRecording,
    startRecording,
    stopRecording,
    recordKey,
    replayMacro,
    replayLastMacro,
    deleteMacro,
    deleteAllMacros,
    setPendingOperator,
    setShowWhichKey,
  ]);

  return null;
}

function RootComponent() {
  const { colorscheme } = Route.useRouteContext();

  return (
    <html lang="en" className={colorscheme}>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider colorscheme={colorscheme}>
          <HistoryProvider>
            <MarksProvider>
              <MacroProvider>
                <NavigationProvider>
                  <BufferProvider>
                    <PaneProvider>
                      <MarkEventsHandler />
                      <HistoryEventsHandler />
                      <MacroEventsHandler />
                      <Outlet />
                    </PaneProvider>
                  </BufferProvider>
                </NavigationProvider>
              </MacroProvider>
            </MarksProvider>
          </HistoryProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

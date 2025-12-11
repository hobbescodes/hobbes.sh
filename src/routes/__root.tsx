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
import { MarksProvider, useMarks } from "@/context/MarksContext";
import { NavigationProvider } from "@/context/NavigationContext";
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
      links: [{ rel: "stylesheet", href: appCss }, ...links],
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

function RootComponent() {
  const { colorscheme } = Route.useRouteContext();

  return (
    <html lang="en" className={colorscheme}>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider colorscheme={colorscheme}>
          <MarksProvider>
            <NavigationProvider>
              <PaneProvider>
                <MarkEventsHandler />
                <Outlet />
              </PaneProvider>
            </NavigationProvider>
          </MarksProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

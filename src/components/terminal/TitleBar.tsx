import { useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import type { FC } from "react";

interface TitleBarProps {
  title: string;
}

interface PathSegment {
  name: string;
  route: string | null; // null means not clickable (current page)
}

/**
 * Parse a title like "👻 ~/hobbescodes/blog/some-post.md" into clickable segments
 */
function parseTitle(title: string): {
  prefix: string;
  segments: PathSegment[];
} {
  // Extract the path portion after "👻 ~/"
  const match = title.match(/^(.*~\/)(hobbescodes.*)$/);
  if (!match) {
    return { prefix: title, segments: [] };
  }

  const prefix = match[1]; // "👻 ~/"
  const pathPart = match[2]; // "hobbescodes/blog/some-post.md"

  // Split by "/" and filter empty strings
  const parts = pathPart.split("/").filter(Boolean);

  // Build segments with their corresponding routes
  const segments: PathSegment[] = parts.map((part, index) => {
    // Last segment is the current page - not clickable
    if (index === parts.length - 1) {
      return { name: part, route: null };
    }

    // Map segment to route
    if (index === 0 && part === "hobbescodes") {
      return { name: part, route: "/" };
    }

    // Build route from path segments (e.g., "blog" -> "/blog", "projects" -> "/projects")
    const routeParts = parts.slice(1, index + 1);
    const route = `/${routeParts.join("/")}`;

    return { name: part, route };
  });

  return { prefix, segments };
}

export const TitleBar: FC<TitleBarProps> = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { prefix, segments } = useMemo(() => parseTitle(title), [title]);

  const handleSegmentClick = (route: string) => {
    // Pass current path as 'from' to preserve cursor position when navigating back
    navigate({ to: route, search: { from: location.pathname } });
  };

  return (
    <div className="flex h-8 select-none items-center border-[var(--surface0)] border-b bg-[var(--mantle)] px-3">
      {/* Traffic light buttons (decorative) */}
      <div className="mr-4 flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: "var(--red)" }}
        />
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: "var(--yellow)" }}
        />
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: "var(--green)" }}
        />
      </div>

      {/* Window title with clickable breadcrumb segments */}
      <div className="flex-1 truncate text-center text-[var(--subtext0)] text-sm">
        {segments.length === 0 ? (
          // Fallback for titles that don't match the expected format
          title
        ) : (
          <>
            {prefix}
            {segments.map((segment, index) => (
              <span key={segment.name}>
                {index > 0 && "/"}
                {segment.route ? (
                  <span
                    onClick={() => handleSegmentClick(segment.route)}
                    className="underline"
                    style={{ cursor: "pointer" }}
                  >
                    {segment.name}
                  </span>
                ) : (
                  <span>{segment.name}</span>
                )}
              </span>
            ))}
          </>
        )}
      </div>

      {/* Spacer for symmetry */}
      <div className="w-14" />
    </div>
  );
};

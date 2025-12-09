import { useEffect, useEffectEvent, useMemo, useRef } from "react";

import type { FC } from "react";
import type { SearchResult } from "@/context/NavigationContext";

// Mock project data for preview - should match projects/index.tsx
const projectsData: Record<
  string,
  { description: string; language: string; stars: number; topics: string[] }
> = {
  "terminal-website": {
    description:
      "A terminal-inspired personal website built with TanStack Start",
    language: "TypeScript",
    stars: 42,
    topics: ["react", "typescript", "terminal", "portfolio"],
  },
  "nvim-config": {
    description: "My Neovim configuration with LSP, Treesitter, and more",
    language: "Lua",
    stars: 128,
    topics: ["neovim", "lua", "dotfiles"],
  },
  "rust-cli-tools": {
    description: "A collection of useful CLI tools written in Rust",
    language: "Rust",
    stars: 89,
    topics: ["rust", "cli", "tools"],
  },
};

// Static page descriptions
const staticPageInfo: Record<string, { description: string; type: string }> = {
  "/": {
    description: "Welcome to hobbescodes - home page",
    type: "markdown",
  },
  "/about": {
    description: "Learn about me, my skills, and my interests",
    type: "markdown",
  },
  "/contact": {
    description: "Get in touch via email or social media",
    type: "markdown",
  },
  "/projects": {
    description: "Browse my projects and open source work",
    type: "directory",
  },
  "/blog": {
    description: "Read my thoughts on development and tech",
    type: "directory",
  },
};

interface SearchOverlayProps {
  query: string;
  results: SearchResult[];
  selectedIndex: number;
  onClose: () => void;
}

export const SearchOverlay: FC<SearchOverlayProps> = ({
  query,
  results,
  selectedIndex,
  onClose,
}) => {
  // Reverse results for telescope-style display (selected at bottom)
  const reversedResults = useMemo(() => [...results].reverse(), [results]);
  // Adjust selected index for reversed array
  const reversedSelectedIndex = results.length - 1 - selectedIndex;

  // Ref for selected item scrolling
  const selectedItemRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view
  const scrollSelectedIntoView = useEffectEvent(() => {
    selectedItemRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  });

  // Auto-scroll when selection changes
  useEffect(() => {
    scrollSelectedIntoView();
  });

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: "rgba(17, 17, 27, 0.85)" }}
      onClick={onClose}
    >
      {/* Key hints - floating above modal */}
      <div
        className="mb-4 flex items-center gap-6 text-xs"
        style={{ color: "var(--overlay1)" }}
      >
        <span>
          <KeyHint>↑↓</KeyHint> navigate
        </span>
        <span>
          <KeyHint>Enter</KeyHint> open
        </span>
        <span>
          <KeyHint>Esc</KeyHint> close
        </span>
      </div>

      {/* Main telescope modal */}
      <div
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-lg"
        style={{
          backgroundColor: "var(--base)",
          border: "1px solid var(--surface1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          maxHeight: "60vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div
          className="px-4 py-2 font-bold text-sm"
          style={{
            backgroundColor: "var(--surface0)",
            color: "var(--blue)",
            borderBottom: "1px solid var(--surface1)",
          }}
        >
          Find Files
        </div>

        {/* Content area - two panes */}
        <div className="flex min-h-0 flex-1">
          {/* Left: Results pane */}
          <div
            className="flex w-[45%] flex-col"
            style={{ borderRight: "1px solid var(--surface1)" }}
          >
            {/* Results header */}
            <div
              className="px-3 py-1.5 font-bold text-xs"
              style={{
                backgroundColor: "var(--mantle)",
                color: "var(--overlay1)",
                borderBottom: "1px solid var(--surface0)",
              }}
            >
              Results ({results.length})
            </div>

            {/* Results list (reversed - selected at bottom) */}
            <div
              className="flex-1 overflow-auto py-1"
              style={{ maxHeight: "40vh" }}
            >
              {results.length === 0 ? (
                <div
                  className="px-3 py-2 text-sm"
                  style={{ color: "var(--overlay0)" }}
                >
                  {query ? "No matches found" : "Start typing to search..."}
                </div>
              ) : (
                reversedResults.map((result, index) => {
                  const isSelected = index === reversedSelectedIndex;
                  // Extract parent path for nested files (e.g., "blog/" from "/blog/post-slug")
                  const pathParts = result.path.split("/").filter(Boolean);
                  const parentPath =
                    pathParts.length > 1 ? `${pathParts[0]}/` : null;

                  return (
                    <div
                      key={result.path}
                      ref={isSelected ? selectedItemRef : null}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm"
                      style={{
                        backgroundColor: isSelected
                          ? "var(--surface1)"
                          : "transparent",
                        color: isSelected ? "var(--text)" : "var(--subtext0)",
                      }}
                    >
                      {/* Selection indicator */}
                      <span
                        style={{
                          color: isSelected ? "var(--blue)" : "transparent",
                          fontWeight: "bold",
                        }}
                      >
                        {">"}
                      </span>

                      {/* Icon */}
                      <span
                        style={{
                          color:
                            result.type === "directory"
                              ? "var(--blue)"
                              : "var(--green)",
                        }}
                      >
                        {result.type === "directory" ? "" : ""}
                      </span>

                      {/* Parent path indicator for nested files */}
                      {parentPath && (
                        <span style={{ color: "var(--overlay1)" }}>
                          {parentPath}
                        </span>
                      )}

                      {/* Name */}
                      <span
                        className="truncate"
                        style={{
                          color:
                            result.type === "directory"
                              ? "var(--blue)"
                              : "var(--text)",
                        }}
                      >
                        {result.displayName}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Preview pane */}
          <div className="flex w-[55%] flex-col">
            {/* Preview header */}
            <div
              className="px-3 py-1.5 font-bold text-xs"
              style={{
                backgroundColor: "var(--mantle)",
                color: "var(--overlay1)",
                borderBottom: "1px solid var(--surface0)",
              }}
            >
              Preview
            </div>

            {/* Preview content */}
            <div
              className="flex-1 overflow-auto p-3"
              style={{ maxHeight: "40vh" }}
            >
              <PreviewPane result={results[selectedIndex]} />
            </div>
          </div>
        </div>

        {/* Input area at bottom */}
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{
            backgroundColor: "var(--surface0)",
            borderTop: "1px solid var(--surface1)",
          }}
        >
          <span style={{ color: "var(--blue)", fontWeight: "bold" }}>
            {">"}
          </span>
          <span style={{ color: "var(--text)" }} className="text-sm">
            {query}
          </span>
          <span
            className="h-4 w-2 animate-pulse"
            style={{ backgroundColor: "var(--cursor)" }}
          />
        </div>
      </div>
    </div>
  );
};

// Helper component for key hints
const KeyHint: FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    className="rounded px-1.5 py-0.5 font-mono text-xs"
    style={{
      backgroundColor: "var(--surface1)",
      color: "var(--blue)",
    }}
  >
    {children}
  </span>
);

// Preview pane component
interface PreviewPaneProps {
  result: SearchResult | undefined;
}

const PreviewPane: FC<PreviewPaneProps> = ({ result }) => {
  const preview = useMemo(() => {
    if (!result) return null;

    // Check if it's a blog post
    if (result.path.startsWith("/blog/") && result.path !== "/blog") {
      return {
        type: "blog" as const,
        title: result.title || result.displayName.replace(".md", ""),
        description: result.snippet || "",
        date: result.date || "",
        readingTime: result.readingTime || "",
        tags: result.tags || [],
      };
    }

    // Check if it's a project
    if (result.path.startsWith("/projects/") && result.path !== "/projects") {
      const slug = result.path.replace("/projects/", "");
      const project = projectsData[slug];
      if (project) {
        return {
          type: "project" as const,
          name: slug,
          description: project.description,
          language: project.language,
          stars: project.stars,
          topics: project.topics,
        };
      }
    }

    // Check for static pages
    const staticInfo = staticPageInfo[result.path];
    if (staticInfo) {
      return {
        type: "static" as const,
        path: result.path,
        description: staticInfo.description,
        fileType: staticInfo.type,
      };
    }

    // Default fallback
    return {
      type: "unknown" as const,
      displayName: result.displayName,
      snippet: result.snippet,
    };
  }, [result]);

  if (!result) {
    return (
      <div
        className="flex h-full items-center justify-center text-sm"
        style={{ color: "var(--overlay0)" }}
      >
        Select an item to preview
      </div>
    );
  }

  if (preview?.type === "blog") {
    return <BlogPreview preview={preview} />;
  }

  if (preview?.type === "project") {
    return <ProjectPreview preview={preview} />;
  }

  if (preview?.type === "static") {
    return <StaticPreview preview={preview} />;
  }

  return (
    <DefaultPreview displayName={result.displayName} snippet={result.snippet} />
  );
};

// Blog post preview
interface BlogPreviewData {
  type: "blog";
  title: string;
  description: string;
  date: string;
  readingTime: string;
  tags: string[];
}

const BlogPreview: FC<{ preview: BlogPreviewData }> = ({ preview }) => (
  <div className="space-y-3 font-mono text-xs">
    {/* Title */}
    <div className="font-bold text-sm" style={{ color: "var(--red)" }}>
      {preview.title}
    </div>

    {/* Description */}
    {preview.description && (
      <div style={{ color: "var(--text)" }}>{preview.description}</div>
    )}

    {/* Metadata */}
    {(preview.date || preview.readingTime) && (
      <div
        className="flex items-center gap-3"
        style={{ color: "var(--overlay1)" }}
      >
        {preview.date && (
          <span>
            <span style={{ color: "var(--blue)" }}>Date:</span> {preview.date}
          </span>
        )}
        {preview.readingTime && (
          <span>
            <span style={{ color: "var(--blue)" }}>Read:</span>{" "}
            {preview.readingTime}
          </span>
        )}
      </div>
    )}

    {/* Tags */}
    {preview.tags.length > 0 && (
      <div className="space-y-1">
        <div style={{ color: "var(--blue)" }}>Tags:</div>
        <div className="flex flex-wrap gap-1">
          {preview.tags.map((tag) => (
            <span
              key={tag}
              className="rounded px-1.5 py-0.5 text-xs"
              style={{
                backgroundColor: "var(--surface1)",
                color: "var(--teal)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Project preview
interface ProjectPreviewData {
  type: "project";
  name: string;
  description: string;
  language: string;
  stars: number;
  topics: string[];
}

const ProjectPreview: FC<{ preview: ProjectPreviewData }> = ({ preview }) => (
  <div className="space-y-3 font-mono text-xs">
    {/* Name */}
    <div className="font-bold text-sm" style={{ color: "var(--blue)" }}>
      {preview.name}
    </div>

    {/* Description */}
    <div style={{ color: "var(--text)" }}>{preview.description}</div>

    {/* Stats */}
    <div
      className="flex items-center gap-4"
      style={{ color: "var(--overlay1)" }}
    >
      <span style={{ color: "var(--yellow)" }}>{preview.language}</span>
      <span>
        <span style={{ color: "var(--peach)" }}>★</span> {preview.stars}
      </span>
    </div>

    {/* Topics */}
    <div className="flex flex-wrap gap-1">
      {preview.topics.map((topic) => (
        <span
          key={topic}
          className="rounded px-1.5 py-0.5 text-xs"
          style={{
            backgroundColor: "var(--surface1)",
            color: "var(--mauve)",
          }}
        >
          {topic}
        </span>
      ))}
    </div>
  </div>
);

// Static page preview
interface StaticPreviewData {
  type: "static";
  path: string;
  description: string;
  fileType: string;
}

const StaticPreview: FC<{ preview: StaticPreviewData }> = ({ preview }) => (
  <div className="space-y-3 font-mono text-xs">
    {/* Path */}
    <div className="font-bold" style={{ color: "var(--green)" }}>
      ~{preview.path === "/" ? "/home" : preview.path}.md
    </div>

    {/* Description */}
    <div style={{ color: "var(--text)" }}>{preview.description}</div>

    {/* File type badge */}
    <div className="flex items-center gap-2">
      <span
        className="rounded px-1.5 py-0.5 text-xs"
        style={{
          backgroundColor: "var(--surface1)",
          color: "var(--sky)",
        }}
      >
        {preview.fileType}
      </span>
    </div>
  </div>
);

// Default preview for unknown types
const DefaultPreview: FC<{ displayName: string; snippet?: string }> = ({
  displayName,
  snippet,
}) => (
  <div className="space-y-2 font-mono text-xs">
    <div style={{ color: "var(--text)" }}>{displayName}</div>
    {snippet && <div style={{ color: "var(--overlay1)" }}>{snippet}</div>}
  </div>
);

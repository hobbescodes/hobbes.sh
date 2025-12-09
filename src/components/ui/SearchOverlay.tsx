import { useMemo } from "react";

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
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(17, 17, 27, 0.85)" }} // --crust with opacity
      onClick={onClose}
    >
      <div
        className="mx-4 flex w-full max-w-xl flex-col overflow-hidden rounded-lg"
        style={{
          backgroundColor: "var(--base)",
          border: "1px solid var(--surface0)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          maxHeight: "400px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-4 py-2 font-bold text-sm"
          style={{
            backgroundColor: "var(--surface0)",
            color: "var(--text)",
            borderBottom: "1px solid var(--surface1)",
          }}
        >
          Find Files
        </div>

        {/* Search Input */}
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{
            borderBottom: "1px solid var(--surface1)",
          }}
        >
          <span style={{ color: "var(--blue)" }}>&gt;</span>
          <span style={{ color: "var(--text)" }} className="font-mono text-sm">
            {query}
          </span>
          <span
            className="h-4 w-2 animate-pulse"
            style={{ backgroundColor: "var(--cursor)" }}
          />
        </div>

        {/* Main Content - Two Panes */}
        <div className="flex min-h-0 flex-1">
          {/* Results Pane */}
          <div
            className="w-1/2 overflow-auto"
            style={{ borderRight: "1px solid var(--surface1)" }}
          >
            {/* Results Header */}
            <div
              className="sticky top-0 px-3 py-1.5 font-bold text-xs"
              style={{
                backgroundColor: "var(--mantle)",
                color: "var(--overlay1)",
                borderBottom: "1px solid var(--surface0)",
              }}
            >
              Results ({results.length})
            </div>

            {/* Results List */}
            <div className="py-1">
              {results.length === 0 ? (
                <div
                  className="px-3 py-2 text-sm"
                  style={{ color: "var(--overlay0)" }}
                >
                  {query ? "No matches found" : "Start typing to search..."}
                </div>
              ) : (
                results.map((result, index) => (
                  <div
                    key={result.path}
                    className="flex items-center gap-2 px-3 py-1.5 font-mono text-sm"
                    style={{
                      backgroundColor:
                        index === selectedIndex
                          ? "var(--surface1)"
                          : "transparent",
                      color:
                        index === selectedIndex
                          ? "var(--text)"
                          : "var(--subtext0)",
                    }}
                  >
                    {/* Selection indicator */}
                    <span
                      style={{
                        color:
                          index === selectedIndex
                            ? "var(--cursor)"
                            : "transparent",
                      }}
                    >
                      &gt;
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
                ))
              )}
            </div>
          </div>

          {/* Preview Pane */}
          <PreviewPane result={results[selectedIndex]} />
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-4 px-4 py-2 text-xs"
          style={{
            backgroundColor: "var(--surface0)",
            color: "var(--overlay1)",
            borderTop: "1px solid var(--surface1)",
          }}
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
      </div>
    </div>
  );
};

// Helper component for key hints
const KeyHint: FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    className="rounded px-1 py-0.5 font-mono text-xs"
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
    // Note: Blog post data is now loaded from markdown files server-side
    // The preview will show basic info from the search result
    if (result.path.startsWith("/blog/") && result.path !== "/blog") {
      const slug = result.path.replace("/blog/", "");
      return {
        type: "blog" as const,
        title: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        date: "",
        readingTime: "",
        tags: [] as string[],
        preview: result.snippet ? [result.snippet] : [],
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

  return (
    <div className="flex w-1/2 flex-col">
      {/* Preview Header */}
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

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-3">
        {!result ? (
          <div
            className="flex h-full items-center justify-center text-sm"
            style={{ color: "var(--overlay0)" }}
          >
            Select an item to preview
          </div>
        ) : preview?.type === "blog" ? (
          <BlogPreview preview={preview} />
        ) : preview?.type === "project" ? (
          <ProjectPreview preview={preview} />
        ) : preview?.type === "static" ? (
          <StaticPreview preview={preview} />
        ) : (
          <DefaultPreview
            displayName={result.displayName}
            snippet={result.snippet}
          />
        )}
      </div>
    </div>
  );
};

// Blog post preview
interface BlogPreviewData {
  type: "blog";
  title: string;
  date: string;
  readingTime: string;
  tags: string[];
  preview: string[];
}

const BlogPreview: FC<{ preview: BlogPreviewData }> = ({ preview }) => (
  <div className="space-y-2 font-mono text-xs">
    {/* Title */}
    <div className="font-bold" style={{ color: "var(--red)" }}>
      # {preview.title}
    </div>

    {/* Metadata */}
    <div
      className="flex items-center gap-3"
      style={{ color: "var(--overlay1)" }}
    >
      <span>{preview.date}</span>
      <span style={{ color: "var(--overlay0)" }}>|</span>
      <span>{preview.readingTime}</span>
    </div>

    {/* Tags */}
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

    {/* Content preview */}
    <div
      className="mt-2 space-y-1 border-t pt-2"
      style={{
        borderColor: "var(--surface1)",
        color: "var(--subtext0)",
      }}
    >
      {preview.preview.map((line, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static preview lines don't reorder
          key={i}
          style={{
            color: line.startsWith("##") ? "var(--peach)" : undefined,
          }}
        >
          {line || "\u00A0"}
        </div>
      ))}
    </div>
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
      ~{preview.path}.md
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

import { usePane } from "@/context/PaneContext";
import { previewAscii } from "@/lib/ascii/preview";

import type { FC } from "react";
import type { Project } from "@/lib/projects";

interface ProjectPreviewProps {
  project: Project;
}

/**
 * ProjectPreview - Preview pane content for project pages
 *
 * Currently shows a placeholder with ASCII art.
 * Will be replaced with iframe implementation later.
 */
export const ProjectPreview: FC<ProjectPreviewProps> = ({ project }) => {
  const { previewUrl } = usePane();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Preview header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          backgroundColor: "var(--mantle)",
          borderBottom: "1px solid var(--surface0)",
        }}
      >
        <span className="font-bold text-sm" style={{ color: "var(--blue)" }}>
          Preview
        </span>
        <span className="text-xs" style={{ color: "var(--overlay1)" }}>
          ^a x to close
        </span>
      </div>

      {/* Preview content */}
      <div
        className="flex flex-1 flex-col items-center justify-center overflow-auto p-4"
        style={{ backgroundColor: "var(--base)" }}
      >
        {/* ASCII placeholder */}
        <pre
          className="text-center text-xs leading-tight"
          style={{ color: "var(--overlay1)" }}
        >
          {previewAscii}
        </pre>

        {/* Project info */}
        <div
          className="mt-6 text-center"
          style={{ color: "var(--text)", maxWidth: "300px" }}
        >
          <div className="mb-2 font-bold" style={{ color: "var(--blue)" }}>
            {project.name}
          </div>

          {previewUrl && (
            <div
              className="mb-4 truncate text-xs"
              style={{ color: "var(--overlay1)" }}
            >
              {previewUrl}
            </div>
          )}

          <div className="text-xs" style={{ color: "var(--subtext0)" }}>
            {project.homepage
              ? "Live preview coming soon..."
              : "No homepage URL available"}
          </div>
        </div>

        {/* Keyboard hints */}
        <div
          className="mt-8 flex flex-col items-center gap-2 text-xs"
          style={{ color: "var(--overlay0)" }}
        >
          <div className="flex items-center gap-4">
            <span>
              <KeyHint>^a h</KeyHint> focus left
            </span>
            <span>
              <KeyHint>^a l</KeyHint> focus right
            </span>
          </div>
          <div>
            <KeyHint>^a x</KeyHint> close preview
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for keyboard hint styling
const KeyHint: FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    className="rounded px-1 py-0.5 font-mono"
    style={{
      backgroundColor: "var(--surface1)",
      color: "var(--blue)",
    }}
  >
    {children}
  </span>
);

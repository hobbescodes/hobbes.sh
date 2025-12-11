import { ExternalLink, X } from "lucide-react";
import { useState } from "react";

import { Spinner } from "@/components/ui/Spinner";
import { usePane } from "@/context/PaneContext";

import type { FC } from "react";

interface ProjectPreviewProps {
  project: {
    owner: string;
    name: string;
    url: string;
  };
}

/**
 * ProjectPreview - Preview pane content for project pages
 *
 * Embeds the full GitHub repository via github1s.com,
 * allowing users to browse the file tree and view code.
 */
export const ProjectPreview: FC<ProjectPreviewProps> = ({ project }) => {
  const { previewUrl, closePreview } = usePane();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const github1sUrl = `https://github1s.com/${project.owner}/${project.name}`;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    closePreview();
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Preview header */}
      <div
        className="flex items-center justify-between gap-2 px-4 py-2"
        style={{
          backgroundColor: "var(--mantle)",
          borderBottom: "1px solid var(--surface0)",
        }}
      >
        <span
          className="truncate font-bold text-sm"
          style={{ color: "var(--blue)" }}
        >
          {project.name}
        </span>

        <div className="flex shrink-0 items-center gap-2">
          {/* Open in browser button */}
          <a
            href={previewUrl || project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="-m-2 flex h-5 min-h-[44px] w-5 min-w-[44px] items-center justify-center text-sm transition-opacity hover:opacity-80 active:opacity-60 md:m-0 md:min-h-[auto] md:min-w-[auto]"
            style={{ color: "var(--green)" }}
            title="Open in new tab"
            aria-label="Open repository in new tab"
          >
            <ExternalLink size={16} />
          </a>

          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="-m-2 flex h-5 min-h-[44px] w-5 min-w-[44px] items-center justify-center text-sm transition-opacity hover:opacity-80 active:opacity-60 md:m-0 md:min-h-[auto] md:min-w-[auto]"
            style={{ color: "var(--overlay1)" }}
            title="Close preview"
            aria-label="Close preview"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Repository browser */}
      <div className="relative flex-1 overflow-hidden">
        {/* Loading spinner */}
        {isLoading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{ backgroundColor: "var(--base)" }}
          >
            <Spinner text="Loading repository..." />
          </div>
        )}

        {/* Error state */}
        {hasError ? (
          <div
            className="flex h-full items-center justify-center"
            style={{ color: "var(--overlay0)" }}
          >
            <div className="text-center">
              <div className="mb-2 text-lg" style={{ color: "var(--red)" }}>
                Failed to load repository
              </div>
              <div className="text-sm">
                Try opening directly:{" "}
                <a
                  href={github1sUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-dotted underline-offset-2 hover:decoration-solid"
                  style={{ color: "var(--blue)" }}
                >
                  {github1sUrl}
                </a>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            src={github1sUrl}
            className="h-full w-full border-none"
            style={{ display: isLoading ? "none" : "block" }}
            onLoad={handleLoad}
            onError={handleError}
            title={`${project.name} repository browser`}
          />
        )}
      </div>

      {/* Footer with project link */}
      {previewUrl && (
        <div
          className="border-t px-4 py-2"
          style={{
            backgroundColor: "var(--mantle)",
            borderColor: "var(--surface0)",
          }}
        >
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-xs underline decoration-dotted underline-offset-2 hover:decoration-solid"
            style={{ color: "var(--blue)" }}
          >
            {previewUrl}
          </a>
        </div>
      )}
    </div>
  );
};

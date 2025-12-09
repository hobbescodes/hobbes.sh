import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo } from "react";

import { Buffer } from "@/components/editor/Buffer";
import { BufferLine } from "@/components/editor/BufferLine";
import { NotFound } from "@/components/NotFound";
import { ProjectPreview } from "@/components/preview/ProjectPreview";
import { SplitPane } from "@/components/terminal/SplitPane";
import { Terminal } from "@/components/terminal/Terminal";
import { usePane } from "@/context/PaneContext";
import { useBufferNavigation } from "@/hooks/useBufferNavigation";
import { getProjectBySlug } from "@/lib/projects";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/projects/$slug")({
  component: ProjectPage,
  loader: ({ params }) => {
    const project = getProjectBySlug(params.slug);
    if (!project) {
      throw notFound();
    }
    return { project };
  },
  head: ({ loaderData }) => {
    const { project } = loaderData;
    const { meta, links } = seo({
      title: project.name,
      description: project.description,
      url: `/projects/${project.name}`,
      keywords: project.topics.join(", "),
    });
    return { meta, links };
  },
  notFoundComponent: NotFound,
});

function ProjectPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { project } = Route.useLoaderData();
  const { openPreview, closePreview, activePane } = usePane();

  // Close preview when navigating away from this page
  useEffect(() => {
    return () => {
      closePreview();
    };
  }, [closePreview]);

  // Build content array - memoized since it depends on project
  const content = useMemo(() => {
    return [
      `# ${project.name}`,
      "",
      project.description,
      "",
      "",
      "## Details",
      "",
      `  Language:    ${project.language}`,
      `  Stars:       ${project.stars}`,
      `  Forks:       ${project.forks}`,
      `  Updated:     ${new Date(project.updatedAt).toLocaleDateString()}`,
      "",
      "",
      "## Topics",
      "",
      ...project.topics.map((t) => `  - ${t}`),
      "",
      "",
      "## Links",
      "",
      `  Repository:  ${project.url}`,
      ...(project.homepage ? [`  Homepage:    ${project.homepage}`] : []),
      "",
    ];
  }, [project]);

  // Handler for Enter on link lines - opens preview pane instead of external link
  const handleLinkEnter = useCallback(
    (url: string) => {
      openPreview(url);
    },
    [openPreview],
  );

  // Only enable buffer navigation when left pane is active
  const isLeftPaneActive = activePane === "left";

  const { currentLine, setCurrentLine, getLineProps } = useBufferNavigation({
    content,
    onNavigateBack: () =>
      navigate({ to: "/projects", search: { from: `/projects/${slug}` } }),
    onLinkEnter: handleLinkEnter,
    enabled: isLeftPaneActive,
  });

  const handleLineDoubleClick = (lineNumber: number) => {
    const lineProps = getLineProps(lineNumber - 1);
    if (lineProps.url) {
      // Double-click still opens external link (gx behavior)
      window.open(lineProps.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Terminal
      title={`👻 ~/hobbescodes/projects/${slug}.md`}
      filepath={`~/hobbescodes/projects/${slug}.md`}
      filetype="markdown"
      line={currentLine}
      col={1}
    >
      <SplitPane>
        <SplitPane.Left>
          <Buffer
            lineCount={content.length + 3}
            currentLine={currentLine}
            contentLineCount={content.length}
            onLineClick={setCurrentLine}
            onLineDoubleClick={handleLineDoubleClick}
          >
            <div style={{ color: "var(--text)" }}>
              {content.map((line, i) => {
                const { isSelected, hasLink } = getLineProps(i);
                return (
                  <BufferLine
                    // biome-ignore lint/suspicious/noArrayIndexKey: content lines are static and don't reorder
                    key={i}
                    isSelected={isSelected}
                    hasLink={hasLink}
                  >
                    <span
                      style={{
                        color: line.startsWith("# ")
                          ? "var(--red)"
                          : line.startsWith("## ")
                            ? "var(--peach)"
                            : line.startsWith("  - ")
                              ? "var(--teal)"
                              : line.includes("https://")
                                ? "var(--blue)"
                                : undefined,
                        fontWeight: line.startsWith("#") ? "bold" : undefined,
                      }}
                    >
                      {line || "\u00A0"}
                    </span>
                  </BufferLine>
                );
              })}
            </div>
          </Buffer>
        </SplitPane.Left>
        <SplitPane.Right>
          <ProjectPreview project={project} />
        </SplitPane.Right>
      </SplitPane>
    </Terminal>
  );
}

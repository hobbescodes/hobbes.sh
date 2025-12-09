import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { Buffer } from "@/components/editor/Buffer";
import { BufferLine } from "@/components/editor/BufferLine";
import { Terminal } from "@/components/terminal/Terminal";
import { useBufferNavigation } from "@/hooks/useBufferNavigation";
import { getProjectBySlug } from "@/lib/projects";

export const Route = createFileRoute("/projects/$slug")({
  component: ProjectPage,
});

function ProjectPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const project = getProjectBySlug(slug);

  // Build content array - memoized since it depends on project
  const content = useMemo(() => {
    if (!project) {
      return [
        "# 404 - Project Not Found",
        "",
        `Could not find project: ${slug}`,
        "",
      ];
    }
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
  }, [project, slug]);

  const { currentLine, setCurrentLine, getLineProps } = useBufferNavigation({
    content,
    onNavigateBack: () =>
      navigate({ to: "/projects", search: { from: `/projects/${slug}` } }),
  });

  const handleLineDoubleClick = (lineNumber: number) => {
    const lineProps = getLineProps(lineNumber - 1);
    if (lineProps.url) {
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
              <BufferLine key={i} isSelected={isSelected} hasLink={hasLink}>
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
    </Terminal>
  );
}

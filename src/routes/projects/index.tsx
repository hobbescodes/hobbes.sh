import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Buffer } from "@/components/editor/Buffer";
import { OilEntry } from "@/components/oil/OilEntry";
import { Terminal } from "@/components/terminal/Terminal";
import { useOilNavigation } from "@/hooks/useOilNavigation";
import { PROJECT_CATEGORIES } from "@/lib/projects.config";
import { seo } from "@/lib/seo";

import type { RouteEntry } from "@/types";

/**
 * Convert categories to RouteEntry format for OilEntry component
 */
const categoryEntries: RouteEntry[] = PROJECT_CATEGORIES.map((category) => ({
  name: category,
  displayName: `${category}/`,
  type: "directory",
  path: `/projects/${category}`,
}));

export const Route = createFileRoute("/projects/")({
  component: ProjectsPage,
  head: () => {
    const { meta, links } = seo({
      title: "Projects",
      description: "Open source projects and experiments by hobbescodes.",
      url: "/projects",
    });
    return { meta, links };
  },
  validateSearch: (search: Record<string, unknown>): { from?: string } => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
});

function ProjectsPage() {
  const navigate = useNavigate();
  const { from } = Route.useSearch();

  // Find the index of the entry we came from (if any)
  // Index 0 is parent (..), so category entries start at 1
  const getInitialIndex = () => {
    if (!from) return 0;
    // Extract category from path like "/projects/owned" -> "owned"
    const category = from.split("/").filter(Boolean)[1];
    const index = PROJECT_CATEGORIES.indexOf(
      category as (typeof PROJECT_CATEGORIES)[number],
    );
    return index >= 0 ? index + 1 : 0; // +1 because parent is index 0
  };

  // Total items: parent (..) + categories
  const totalItems = 1 + categoryEntries.length;

  const { selectedIndex, handleItemClick } = useOilNavigation({
    totalItems,
    initialIndex: getInitialIndex(),
    onNavigate: (index) => {
      if (index === 0) {
        navigate({ to: "/", search: { from: "/projects" } });
      } else {
        const category = PROJECT_CATEGORIES[index - 1];
        if (category) {
          navigate({ to: `/projects/${category}` });
        }
      }
    },
    onNavigateToParent: () =>
      navigate({ to: "/", search: { from: "/projects" } }),
  });

  // Line calculation: entries (no header)
  const currentLine = selectedIndex + 1;
  const totalLines = totalItems + 5;
  // Content lines = all entries (no header)
  const contentLines = totalItems;

  return (
    <Terminal
      title="👻 ~/hobbescodes/projects/"
      filepath="~/hobbescodes/projects/"
      filetype="oil"
      line={currentLine}
      col={1}
    >
      <Buffer
        lineCount={totalLines}
        currentLine={currentLine}
        contentLineCount={contentLines}
      >
        <div className="flex flex-col leading-[1.6]">
          {/* Parent directory entry */}
          <OilEntry
            entry={{
              name: "..",
              displayName: "../",
              type: "directory",
              path: "/",
            }}
            isSelected={selectedIndex === 0}
            isParent
            onClick={() => handleItemClick(0)}
          />

          {/* Category entries */}
          {categoryEntries.map((entry, index) => (
            <OilEntry
              key={entry.path}
              entry={entry}
              isSelected={selectedIndex === index + 1}
              onClick={() => handleItemClick(index + 1)}
            />
          ))}
        </div>
      </Buffer>
    </Terminal>
  );
}

import { useNavigate } from "@tanstack/react-router";

import { Buffer } from "@/components/editor/Buffer";
import { OilEntry } from "@/components/oil/OilEntry";
import { Terminal } from "@/components/terminal/Terminal";
import { useOilNavigation } from "@/hooks/useOilNavigation";
import { getCategoryAliases } from "@/lib/projects.config";

import type { RepositoryFieldsFragment } from "@tangrams/github/schema";
import type { FC } from "react";
import type { ProjectCategory } from "@/lib/projects.config";
import type { RouteEntry } from "@/types";

/** Type for aliased query responses - keys are aliases, values are repos or null */
type AliasedRepoResponse = Record<string, RepositoryFieldsFragment | null>;

/**
 * Extract repositories from an aliased query response in the correct order.
 * Uses the category's alias list to maintain the order defined in projects.config.ts.
 */
function extractReposFromAliasedQuery(
  data: AliasedRepoResponse,
  category: ProjectCategory,
): RepositoryFieldsFragment[] {
  const aliases = getCategoryAliases(category);
  return aliases
    .map((alias) => data[alias])
    .filter((repo): repo is RepositoryFieldsFragment => repo !== null);
}

/**
 * Convert repository data to RouteEntry format for OilEntry component
 */
function getProjectRouteEntries(
  repos: RepositoryFieldsFragment[],
): RouteEntry[] {
  return repos.map((r) => ({
    name: r.name,
    displayName: `${r.name}.md`,
    type: "file",
    path: `/projects/${r.name}`,
  }));
}

interface ProjectCategoryPageProps {
  category: ProjectCategory;
  /** The display name for the terminal title and path (e.g., "owned", "orgs", "contrib") */
  categoryDisplay: string;
  /** The aliased query response data */
  data: AliasedRepoResponse;
  /** The slug to match when returning from a project detail page */
  fromSlug?: string;
}

export const ProjectCategoryPage: FC<ProjectCategoryPageProps> = ({
  category,
  categoryDisplay,
  data,
  fromSlug,
}) => {
  const navigate = useNavigate();

  // Extract repositories from the aliased query response
  const projects = extractReposFromAliasedQuery(data, category);

  // Find the index of the entry we came from (if any)
  // Index 0 is parent (..), so project entries start at 1
  const getInitialIndex = () => {
    if (!fromSlug) return 0;
    const index = projects.findIndex((p) => p.name === fromSlug);
    return index >= 0 ? index + 1 : 0; // +1 because parent is index 0
  };

  // Total items: parent (..) + projects
  const totalItems = 1 + projects.length;

  const { selectedIndex, handleItemClick } = useOilNavigation({
    totalItems,
    initialIndex: getInitialIndex(),
    onNavigate: (index) => {
      if (index === 0) {
        navigate({
          to: "/projects",
          search: { from: `/projects/${category}` },
        });
      } else {
        const project = projects[index - 1];
        if (project) {
          navigate({ to: "/projects/$slug", params: { slug: project.name } });
        }
      }
    },
    onNavigateToParent: () =>
      navigate({ to: "/projects", search: { from: `/projects/${category}` } }),
  });

  const projectEntries = getProjectRouteEntries(projects);

  // Line calculation: entries (no header)
  const currentLine = selectedIndex + 1;
  const totalLines = totalItems + 5;
  // Content lines = all entries (no header)
  const contentLines = totalItems;

  return (
    <Terminal
      title={`👻 ~/hobbescodes/projects/${categoryDisplay}/`}
      filepath={`~/hobbescodes/projects/${categoryDisplay}/`}
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
              path: "/projects",
            }}
            isSelected={selectedIndex === 0}
            isParent
            onClick={() => handleItemClick(0)}
          />

          {/* Project entries */}
          {projectEntries.map((entry, index) => (
            <OilEntry
              key={entry.path}
              entry={entry}
              isSelected={selectedIndex === index + 1}
              onClick={() => handleItemClick(index + 1)}
            >
              {/* Project metadata */}
              <span
                className="ml-2 text-xs"
                style={{ color: "var(--overlay0)" }}
              >
                {projects[index].primaryLanguage?.name ?? "Unknown"} | ★{" "}
                {projects[index].stargazerCount}
              </span>
            </OilEntry>
          ))}
        </div>
      </Buffer>
    </Terminal>
  );
};

import { useSuspenseQueries } from "@tanstack/react-query";
import { notFound, useNavigate } from "@tanstack/react-router";

import { Buffer } from "@/components/editor/Buffer";
import { OilEntry } from "@/components/oil/OilEntry";
import { Terminal } from "@/components/terminal/Terminal";
import { getRepositoryQueryOptions } from "@/generated/operations";
import { useOilNavigation } from "@/hooks/useOilNavigation";
import { getReposByCategory } from "@/lib/projects.config";

import type { QueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import type { RepositoryFieldsFragment } from "@/generated/types";
import type { ProjectCategory } from "@/lib/projects.config";
import type { RouteEntry } from "@/types";

/**
 * Prefetch all repositories for a category.
 * Used in route loaders to ensure data is available for SSR.
 * Throws notFound if any repository in the category doesn't exist.
 */
export const prefetchCategoryRepos = async (
  queryClient: QueryClient,
  category: ProjectCategory,
) => {
  const repoConfigs = getReposByCategory(category);
  const results = await Promise.all(
    repoConfigs.map((config) =>
      queryClient.ensureQueryData(
        getRepositoryQueryOptions({ owner: config.owner, name: config.repo }),
      ),
    ),
  );

  // Throw notFound if any repository doesn't exist
  for (const result of results) {
    if (!result.repository) {
      throw notFound();
    }
  }
};

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
  /** The slug to match when returning from a project detail page */
  fromSlug?: string;
}

export const ProjectCategoryPage: FC<ProjectCategoryPageProps> = ({
  category,
  categoryDisplay,
  fromSlug,
}) => {
  const navigate = useNavigate();

  // Get the repo configs for this category
  const repoConfigs = getReposByCategory(category);

  // Fetch all repositories in parallel using generated queryOptions
  const results = useSuspenseQueries({
    queries: repoConfigs.map((config) =>
      getRepositoryQueryOptions({ owner: config.owner, name: config.repo }),
    ),
  });

  // Extract the repository data, filtering out any null results
  const projects = results
    .map((result) => result.data.repository)
    .filter((repo): repo is RepositoryFieldsFragment => repo !== null);

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

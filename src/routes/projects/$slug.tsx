import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  notFound,
  stripSearchParams,
  useNavigate,
} from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { Buffer } from "@/components/editor/Buffer";
import { BufferLine } from "@/components/editor/BufferLine";
import { NotFound } from "@/components/NotFound";
import { ProjectPreview } from "@/components/preview/ProjectPreview";
import { SplitPane } from "@/components/terminal/SplitPane";
import { Terminal } from "@/components/terminal/Terminal";
import { usePane } from "@/context/PaneContext";
import { getRepositoryWithReadmeQueryOptions } from "@/generated/operations";
import { useBufferNavigation } from "@/hooks/useBufferNavigation";
import { getAllFeaturedRepos, getCategoryForRepo } from "@/lib/projects.config";
import { seo } from "@/lib/seo";
import { getPreviewState, setPreviewState } from "@/server/functions/preview";

interface ProjectSearchParams {
  preview?: boolean;
}

const defaultSearch: ProjectSearchParams = {
  preview: undefined,
};

/**
 * Find the repo config for a given slug (repo name)
 */
function findRepoConfigBySlug(slug: string) {
  const allRepos = getAllFeaturedRepos();
  return allRepos.find((config) => config.repo === slug);
}

export const Route = createFileRoute("/projects/$slug")({
  component: ProjectPage,
  validateSearch: (search: Record<string, unknown>): ProjectSearchParams => ({
    preview: search.preview === true || search.preview === "true" || undefined,
  }),
  search: {
    middlewares: [stripSearchParams(defaultSearch)],
  },
  loader: async ({ params, context }) => {
    // Validate slug is in featured repos list and get repo config
    const repoConfig = findRepoConfigBySlug(params.slug);
    if (!repoConfig) {
      throw notFound();
    }

    // Prefetch project data and get initial preview state
    const [repoData, initialPreviewOpen] = await Promise.all([
      context.queryClient.ensureQueryData(
        getRepositoryWithReadmeQueryOptions({
          owner: repoConfig.owner,
          name: repoConfig.repo,
        }),
      ),
      getPreviewState(),
    ]);

    // Throw notFound if repository doesn't exist
    if (!repoData.repository) {
      throw notFound();
    }

    return { repoConfig, initialPreviewOpen };
  },
  head: ({ params }) => {
    const { meta, links } = seo({
      title: params.slug,
      description: `Project: ${params.slug}`,
      url: `/projects/${params.slug}`,
    });
    return { meta, links };
  },
  notFoundComponent: NotFound,
});

function ProjectPage() {
  const { slug } = Route.useParams();
  const { preview } = Route.useSearch();
  const { repoConfig, initialPreviewOpen } = Route.useLoaderData();
  const navigate = useNavigate();
  const {
    isPreviewOpen,
    openPreview,
    closePreview,
    activePane,
    setOnCloseCallback,
  } = usePane();

  const { data } = useSuspenseQuery(
    getRepositoryWithReadmeQueryOptions({
      owner: repoConfig.owner,
      name: repoConfig.repo,
    }),
  );

  // biome-ignore lint/style/noNonNullAssertion: loader throws notFound if null
  const repository = data.repository!;

  // Extract fields from the repository data
  const name = repository.name;
  const description = repository.description ?? "No description provided";
  const url = repository.url;
  const language = repository.primaryLanguage?.name ?? "Unknown";
  const stars = repository.stargazerCount;
  const forks = repository.forkCount;
  const topics =
    repository.repositoryTopics.nodes?.map((n) => n.topic.name) ?? [];
  const updatedAt = repository.updatedAt;
  const owner = (repository.owner as { login: string }).login;
  // README is available via repository.object.text if needed in the future
  // const readme = (repository.object as { text?: string } | null)?.text;

  // Track if we've already initialized to prevent re-opening after close
  const hasInitialized = useRef(false);

  // Initialize preview state from cookie/search param on first render
  // Only run once to prevent re-opening after user closes
  if (!hasInitialized.current) {
    const shouldOpenPreview = preview || initialPreviewOpen;
    if (shouldOpenPreview && !isPreviewOpen) {
      openPreview(url);
    }
    hasInitialized.current = true;
  }

  // Register callback for when preview closes via ^a x or close button
  // This syncs the URL and cookie when the context closes the preview
  useEffect(() => {
    const onPreviewClose = () => {
      setPreviewState({ data: false });
      navigate({ search: {} });
    };

    setOnCloseCallback(onPreviewClose);

    // Cleanup: unregister callback when component unmounts
    return () => setOnCloseCallback(undefined);
  }, [navigate, setOnCloseCallback]);

  // Close preview when navigating away from this project
  useEffect(() => {
    return () => {
      closePreview();
    };
  }, [closePreview]);

  // Build content array - memoized since it depends on repository data
  const content = useMemo(() => {
    return [
      `# ${name}`,
      "",
      description,
      "",
      "",
      "## Details",
      "",
      `  Language:    ${language}`,
      `  Stars:       ${stars}`,
      `  Forks:       ${forks}`,
      `  Updated:     ${new Date(updatedAt).toLocaleDateString()}`,
      "",
      "",
      "## Topics",
      "",
      ...topics.map((t) => `  - ${t}`),
      "",
      "",
      "## Links",
      "",
      `  Repository:  ${url}`,
      "",
    ];
  }, [name, description, language, stars, forks, updatedAt, topics, url]);

  // Handler for Enter on link lines - opens preview pane and updates URL/cookie
  const handleLinkEnter = useCallback(
    (linkUrl: string) => {
      openPreview(linkUrl);
      setPreviewState({ data: true });
      navigate({ search: { preview: true } });
    },
    [openPreview, navigate],
  );

  // Only enable buffer navigation when left pane is active
  const isLeftPaneActive = activePane === "left";

  // Determine which category this project belongs to for back navigation
  const projectCategory = getCategoryForRepo(slug);
  const backPath = projectCategory
    ? `/projects/${projectCategory}`
    : "/projects";

  const { currentLine, setCurrentLine, getLineProps } = useBufferNavigation({
    content,
    onNavigateBack: () =>
      navigate({ to: backPath, search: { from: `/projects/${slug}` } }),
    onLinkEnter: handleLinkEnter,
    enabled: isLeftPaneActive,
  });

  const handleLinkClick = (lineNumber: number) => {
    const lineProps = getLineProps(lineNumber - 1);
    if (lineProps.url) {
      // Single click on link line opens preview pane
      handleLinkEnter(lineProps.url);
    }
  };

  const hasLinkAt = (lineIndex: number): boolean => {
    return getLineProps(lineIndex).hasLink;
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
            onLinkClick={handleLinkClick}
            hasLinkAt={hasLinkAt}
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
          <ProjectPreview project={{ owner, name, url }} />
        </SplitPane.Right>
      </SplitPane>
    </Terminal>
  );
}

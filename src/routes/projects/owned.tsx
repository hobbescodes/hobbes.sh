import { createFileRoute } from "@tanstack/react-router";

import {
  ProjectCategoryPage,
  prefetchCategoryRepos,
} from "@/components/projects/ProjectCategoryPage";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/projects/owned")({
  component: OwnedProjectsPage,
  loader: ({ context }) => prefetchCategoryRepos(context.queryClient, "owned"),
  head: () => {
    const { meta, links } = seo({
      title: "Owned Projects",
      description: "Personal projects owned by hobbescodes.",
      url: "/projects/owned",
    });
    return { meta, links };
  },
  validateSearch: (search: Record<string, unknown>): { from?: string } => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
});

function OwnedProjectsPage() {
  const { from } = Route.useSearch();

  // Extract slug from "from" path (e.g., "/projects/hobbes.sh" -> "hobbes.sh")
  const fromSlug = from?.startsWith("/projects/")
    ? from.split("/").filter(Boolean)[1]
    : undefined;

  return (
    <ProjectCategoryPage
      category="owned"
      categoryDisplay="owned"
      fromSlug={fromSlug}
    />
  );
}

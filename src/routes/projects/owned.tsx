import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { getOwnedReposQueryOptions } from "@tangrams/github/query/options";
import { ProjectCategoryPage } from "@/components/projects/ProjectCategoryPage";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/projects/owned")({
  component: OwnedProjectsPage,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(getOwnedReposQueryOptions()),
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
  const { data } = useSuspenseQuery(getOwnedReposQueryOptions());

  // Extract slug from "from" path (e.g., "/projects/hobbes.sh" -> "hobbes.sh")
  const fromSlug = from?.startsWith("/projects/")
    ? from.split("/").filter(Boolean)[1]
    : undefined;

  return (
    <ProjectCategoryPage
      category="owned"
      categoryDisplay="owned"
      data={data}
      fromSlug={fromSlug}
    />
  );
}

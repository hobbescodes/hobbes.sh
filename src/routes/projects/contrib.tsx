import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ProjectCategoryPage } from "@/components/projects/ProjectCategoryPage";
import { getContribReposQueryOptions } from "@/generated/github/query/operations";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/projects/contrib")({
  component: ContribProjectsPage,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(getContribReposQueryOptions()),
  head: () => {
    const { meta, links } = seo({
      title: "Contributions",
      description: "Open source projects hobbescodes has contributed to.",
      url: "/projects/contrib",
    });
    return { meta, links };
  },
  validateSearch: (search: Record<string, unknown>): { from?: string } => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
});

function ContribProjectsPage() {
  const { from } = Route.useSearch();
  const { data } = useSuspenseQuery(getContribReposQueryOptions());

  // Extract slug from "from" path (e.g., "/projects/prise" -> "prise")
  const fromSlug = from?.startsWith("/projects/")
    ? from.split("/").filter(Boolean)[1]
    : undefined;

  return (
    <ProjectCategoryPage
      category="contrib"
      categoryDisplay="contrib"
      data={data}
      fromSlug={fromSlug}
    />
  );
}

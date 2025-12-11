import { createFileRoute } from "@tanstack/react-router";

import {
  ProjectCategoryPage,
  projectsByCategoryQueryOptions,
} from "@/components/projects/ProjectCategoryPage";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/projects/omnidotdev")({
  component: OmnidotdevProjectsPage,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      projectsByCategoryQueryOptions("omnidotdev"),
    ),
  head: () => {
    const { meta, links } = seo({
      title: "Omnidotdev Projects",
      description: "Projects from the omnidotdev organization.",
      url: "/projects/omnidotdev",
    });
    return { meta, links };
  },
  validateSearch: (search: Record<string, unknown>): { from?: string } => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
});

function OmnidotdevProjectsPage() {
  const { from } = Route.useSearch();

  // Extract slug from "from" path (e.g., "/projects/rdk" -> "rdk")
  const fromSlug = from?.startsWith("/projects/")
    ? from.split("/").filter(Boolean)[1]
    : undefined;

  return (
    <ProjectCategoryPage
      category="omnidotdev"
      categoryDisplay="omnidotdev"
      fromSlug={fromSlug}
    />
  );
}

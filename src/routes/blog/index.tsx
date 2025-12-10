import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Buffer } from "@/components/editor/Buffer";
import { OilEntry } from "@/components/oil/OilEntry";
import { Terminal } from "@/components/terminal/Terminal";
import { useOilNavigation } from "@/hooks/useOilNavigation";
import { getAllBlogPosts } from "@/lib/content";
import { seo } from "@/lib/seo";

import type { RouteEntry } from "@/types";

export const Route = createFileRoute("/blog/")({
  component: BlogPage,
  loader: () => {
    const posts = getAllBlogPosts();
    return { posts };
  },
  head: () => {
    const { meta, links } = seo({
      title: "Blog",
      description:
        "Thoughts on software engineering, tools, and the craft of building things.",
      url: "/blog",
    });
    return { meta, links };
  },
  validateSearch: (search: Record<string, unknown>): { from?: string } => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
});

function BlogPage() {
  const navigate = useNavigate();
  const { from } = Route.useSearch();
  const { posts } = Route.useLoaderData();

  // Find the index of the entry we came from (if any)
  // Index 0 is parent (..), so post entries start at 1
  const getInitialIndex = () => {
    if (!from) return 0;
    const slug = from.split("/").filter(Boolean)[1]; // e.g., "/blog/foo" -> "foo"
    const index = posts.findIndex((p) => p.slug === slug);
    return index >= 0 ? index + 1 : 0; // +1 because parent is index 0
  };

  // Convert posts to RouteEntry format for OilEntry component
  const postEntries: RouteEntry[] = posts.map((p) => ({
    name: p.slug,
    displayName: `${p.slug}.md`,
    type: "file",
    path: `/blog/${p.slug}`,
  }));

  // Total items: parent (..) + posts
  const totalItems = 1 + posts.length;

  const { selectedIndex, handleItemClick } = useOilNavigation({
    totalItems,
    initialIndex: getInitialIndex(),
    onNavigate: (index) => {
      if (index === 0) {
        navigate({ to: "/", search: { from: "/blog" } });
      } else {
        const post = posts[index - 1];
        if (post) {
          navigate({ to: "/blog/$slug", params: { slug: post.slug } });
        }
      }
    },
    onNavigateToParent: () => navigate({ to: "/", search: { from: "/blog" } }),
  });

  // Line calculation: entries (no header)
  const currentLine = selectedIndex + 1;
  const totalLines = totalItems + 5;
  // Content lines = all entries (no header)
  const contentLines = totalItems;

  return (
    <Terminal
      title="👻 ~/hobbescodes/blog/"
      filepath="~/hobbescodes/blog/"
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

          {/* Blog post entries */}
          {postEntries.map((entry, index) => (
            <OilEntry
              key={entry.path}
              entry={entry}
              isSelected={selectedIndex === index + 1}
              onClick={() => handleItemClick(index + 1)}
            >
              {/* Post metadata */}
              <span
                className="ml-2 text-xs"
                style={{ color: "var(--overlay0)" }}
              >
                {posts[index].date}
                {/* Hide reading time on small screens */}
                <span className="hidden sm:inline">
                  {" "}
                  | {posts[index].readingTime}
                </span>
              </span>
            </OilEntry>
          ))}
        </div>
      </Buffer>
    </Terminal>
  );
}

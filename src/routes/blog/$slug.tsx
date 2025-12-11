import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { Buffer } from "@/components/editor/Buffer";
import { NotFound } from "@/components/NotFound";
import { Terminal } from "@/components/terminal/Terminal";
import { SyntaxHighlight } from "@/components/ui/SyntaxHighlight";
import { useBufferNavigation } from "@/hooks/useBufferNavigation";
import { loadBlogPost } from "@/lib/content";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
  loader: ({ params }) => {
    const post = loadBlogPost(params.slug);
    if (!post) {
      throw notFound();
    }
    return { post };
  },
  head: ({ loaderData }) => {
    const { meta, links } = seo({
      // biome-ignore lint: meh
      title: loaderData?.post.title!,
      description: loaderData?.post.description,
      url: `/blog/${loaderData?.post.slug}`,
      type: "article",
      publishedTime: loaderData?.post.date,
      tags: loaderData?.post.tags,
    });
    return { meta, links };
  },
  notFoundComponent: NotFound,
});

function BlogPostPage() {
  const navigate = useNavigate();
  const { post } = Route.useLoaderData();

  // Build content lines with metadata header
  const allContent = useMemo(() => {
    const metadataLines = [
      `# ${post.title}`,
      "",
      `  Date: ${post.date}`,
      `  Tags: ${post.tags.join(", ")}`,
      `  Reading time: ${post.readingTime}`,
      "",
      "---",
      "",
    ];
    return [...metadataLines, ...post.content];
  }, [post]);

  const { currentLine, setCurrentLine, getLineProps } = useBufferNavigation({
    content: allContent,
    onNavigateBack: () =>
      navigate({ to: "/blog", search: { from: `/blog/${post.slug}` } }),
  });

  return (
    <Terminal
      title={`👻 ~/hobbescodes/blog/${post.slug}.md`}
      filepath={`~/hobbescodes/blog/${post.slug}.md`}
      filetype="markdown"
      line={currentLine}
      col={1}
    >
      <Buffer
        lineCount={allContent.length + 3}
        currentLine={currentLine}
        contentLineCount={allContent.length}
        onLineClick={setCurrentLine}
      >
        <SyntaxHighlight
          content={allContent}
          filetype="markdown"
          getLineProps={getLineProps}
        />
      </Buffer>
    </Terminal>
  );
}

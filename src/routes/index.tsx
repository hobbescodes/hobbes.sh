import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Buffer } from "@/components/editor/Buffer";
import { OilNavigator } from "@/components/oil/OilNavigator";
import { Terminal } from "@/components/terminal/Terminal";
import { SyntaxHighlight } from "@/components/ui/SyntaxHighlight";
import { hobbesAscii } from "@/lib/ascii/hobbes";
import { loadPageContent } from "@/lib/content";
import { routeTree } from "@/lib/routes";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: () => {
    const content = loadPageContent("home.md");
    return { content };
  },
  head: () => {
    const { meta, links } = seo({
      title: "Home",
      description:
        "Welcome to hobbescodes - software engineer and tiger enthusiast. Building things on the internet.",
      url: "/",
    });
    return { meta, links };
  },
  validateSearch: (search: Record<string, unknown>): { from?: string } => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
});

function HomePage() {
  const { from } = Route.useSearch();
  const { content } = Route.useLoaderData();
  const entries = routeTree.children || [];

  // Find the index of the entry we came from (if any)
  const initialIndex = useMemo(() => {
    if (!from) return 0;
    // Extract the first segment of the path (e.g., "/projects/foo" -> "projects")
    const segment = from.split("/").filter(Boolean)[0];
    const index = entries.findIndex((e) => e.name === segment);
    return index >= 0 ? index : 0;
  }, [from, entries]);

  // Calculate line counts for the buffer
  const asciiLineCount = hobbesAscii.split("\n").length;

  // Line where oil navigator starts (after ASCII + content)
  const oilStartLine = asciiLineCount + content.length + 1;

  // Current line is reported by OilNavigator via callback
  const [currentLine, setCurrentLine] = useState(
    oilStartLine + 1 + initialIndex,
  );

  const totalLines = oilStartLine + entries.length + 5;
  // Content lines = ASCII + markdown content + oil header + entries
  const contentLines = oilStartLine + 1 + entries.length;

  return (
    <Terminal
      title="👻 ~/hobbescodes/"
      filepath="~/hobbescodes/"
      filetype="oil"
      line={currentLine}
      col={1}
    >
      <Buffer
        lineCount={totalLines}
        currentLine={currentLine}
        contentLineCount={contentLines}
      >
        {/* ASCII Art Banner */}
        <pre className="text-[var(--mauve)] leading-[1.6]">{hobbesAscii}</pre>

        {/* Welcome text from markdown */}
        <SyntaxHighlight content={content} filetype="markdown" />

        {/* Oil navigator - key resets state when navigation source changes */}
        <OilNavigator
          key={from ?? "home"}
          entries={entries}
          currentPath="/"
          initialIndex={initialIndex}
          startLine={oilStartLine}
          onCurrentLineChange={setCurrentLine}
          showParent={false}
        />
      </Buffer>
    </Terminal>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Buffer } from "@/components/editor/Buffer";
import { Terminal } from "@/components/terminal/Terminal";
import { SyntaxHighlight } from "@/components/ui/SyntaxHighlight";
import { useBufferNavigation } from "@/hooks/useBufferNavigation";
import { loadPageContent } from "@/lib/content";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  loader: () => {
    const content = loadPageContent("contact.md");
    return { content };
  },
});

function ContactPage() {
  const navigate = useNavigate();
  const { content } = Route.useLoaderData();

  const { currentLine, setCurrentLine, getLineProps } = useBufferNavigation({
    content,
    onNavigateBack: () => navigate({ to: "/", search: { from: "/contact" } }),
  });

  const handleLineDoubleClick = (lineNumber: number) => {
    const lineProps = getLineProps(lineNumber - 1); // getLineProps uses 0-indexed
    if (lineProps.url) {
      window.open(lineProps.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Terminal
      title="👻 ~/hobbescodes/contact.md"
      filepath="~/hobbescodes/contact.md"
      filetype="markdown"
      line={currentLine}
      col={1}
    >
      <Buffer
        lineCount={content.length + 3}
        currentLine={currentLine}
        contentLineCount={content.length}
        onLineClick={setCurrentLine}
        onLineDoubleClick={handleLineDoubleClick}
      >
        <SyntaxHighlight
          content={content}
          filetype="markdown"
          getLineProps={getLineProps}
        />
      </Buffer>
    </Terminal>
  );
}

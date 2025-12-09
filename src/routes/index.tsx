import { Buffer } from "@/components/editor";
import { OilNavigator } from "@/components/oil";
import { Terminal } from "@/components/terminal";
import { SyntaxHighlight } from "@/components/ui/SyntaxHighlight";
import { hobbesAscii } from "@/lib/ascii/hobbes";
import { loadPageContent } from "@/lib/content";
import { routeTree } from "@/lib/routes";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
	component: HomePage,
	loader: () => {
		const content = loadPageContent("home.md");
		return { content };
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

	const [selectedIndex, setSelectedIndex] = useState(initialIndex);

	// Update selected index when 'from' changes (navigating back)
	useEffect(() => {
		setSelectedIndex(initialIndex);
	}, [initialIndex]);

	// Calculate line counts for the buffer
	const asciiLineCount = hobbesAscii.split("\n").length;

	// Line where oil navigator starts (after ASCII + content)
	const oilStartLine = asciiLineCount + content.length + 1;
	// Current line = oil start + 1 (for header) + selectedIndex
	const currentLine = oilStartLine + 1 + selectedIndex;

	const totalLines = oilStartLine + entries.length + 5;

	return (
		<Terminal
			title="👻 ~/hobbescodes/"
			filepath="~/hobbescodes/"
			filetype="oil"
			line={currentLine}
			col={1}
		>
			<Buffer lineCount={totalLines} currentLine={currentLine}>
				{/* ASCII Art Banner */}
				<pre className="text-[var(--mauve)] leading-[1.6]">{hobbesAscii}</pre>

				{/* Welcome text from markdown */}
				<SyntaxHighlight content={content} filetype="markdown" />

				{/* Oil navigator */}
				<OilNavigator
					entries={entries}
					currentPath="/"
					selectedIndex={selectedIndex}
					onSelectedIndexChange={setSelectedIndex}
					showParent={false}
				/>
			</Buffer>
		</Terminal>
	);
}

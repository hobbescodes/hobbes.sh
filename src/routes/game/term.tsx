import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";

import { InteractiveTerminal } from "@/components/terminal/InteractiveTerminal";
import { Terminal } from "@/components/terminal/Terminal";
import { useNavigation } from "@/context/NavigationContext";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/game/term")({
  component: TerminalPage,
  head: () => {
    const { meta, links } = seo({
      title: "Terminal",
      description:
        "An interactive terminal easter egg - explore the virtual filesystem!",
      url: "/game/term",
    });
    return { meta, links };
  },
});

function TerminalPage() {
  const navigate = useNavigate();
  const { setMode } = useNavigation();

  // Set GAME mode on mount (prevents normal vim keybindings), reset on unmount
  useEffect(() => {
    setMode("GAME");
    return () => setMode("NORMAL");
  }, [setMode]);

  const handleExit = useCallback(() => {
    navigate({ to: "/", search: {} });
  }, [navigate]);

  return (
    <Terminal
      title="~/hobbescodes/term"
      filepath="~/hobbescodes/term"
      filetype="term"
      line={1}
      col={1}
    >
      <InteractiveTerminal onExit={handleExit} />
    </Terminal>
  );
}

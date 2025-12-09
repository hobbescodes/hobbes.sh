import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { SnakeGame } from "@/components/game/SnakeGame";
import { Terminal } from "@/components/terminal/Terminal";
import { useNavigation } from "@/context/NavigationContext";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/game/snake")({
  component: SnakeGamePage,
  head: () => {
    const { meta, links } = seo({
      title: "Snake",
      description: "Play Snake in the terminal - a hidden easter egg!",
      url: "/game/snake",
    });
    return { meta, links };
  },
});

function SnakeGamePage() {
  const navigate = useNavigate();
  const { setMode } = useNavigation();
  const [snakeHead, setSnakeHead] = useState({ x: 1, y: 1 });

  // Set GAME mode on mount, reset on unmount
  useEffect(() => {
    setMode("GAME");
    return () => setMode("NORMAL");
  }, [setMode]);

  const handleExit = useCallback(() => {
    navigate({ to: "/", search: {} });
  }, [navigate]);

  const handleSnakeMove = useCallback((x: number, y: number) => {
    setSnakeHead({ x, y });
  }, []);

  return (
    <Terminal
      title="👻 ~/hobbescodes/game/snake"
      filepath="~/hobbescodes/game/snake"
      filetype="game"
      line={snakeHead.y}
      col={snakeHead.x}
    >
      <SnakeGame onExit={handleExit} onSnakeMove={handleSnakeMove} />
    </Terminal>
  );
}

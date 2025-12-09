import { useCallback, useEffect, useRef, useState } from "react";

import type { FC } from "react";

// Game constants
const GRID_WIDTH = 40;
const GRID_HEIGHT = 20;
const TICK_INTERVAL = 200; // ms (slower = easier)
const STORAGE_KEY = "hobbescodes-snake-highscore";

// Types
type GameState = "IDLE" | "PLAYING" | "PAUSED" | "GAME_OVER";
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

interface Position {
  x: number;
  y: number;
}

interface SnakeGameProps {
  onExit: () => void;
  onSnakeMove?: (x: number, y: number) => void;
}

// Visual characters
const CHARS = {
  snakeHead: "▓",
  snakeBody: "█",
  food: "●",
  empty: "·",
  borderTopLeft: "╔",
  borderTopRight: "╗",
  borderBottomLeft: "╚",
  borderBottomRight: "╝",
  borderHorizontal: "═",
  borderVertical: "║",
} as const;

// Helper to load high score from localStorage
const loadHighScore = (): number => {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? Number.parseInt(stored, 10) : 0;
};

// Helper to save high score to localStorage
const saveHighScore = (score: number): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, score.toString());
};

// Generate random position for food
const getRandomPosition = (snake: Position[]): Position => {
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT),
    };
  } while (snake.some((seg) => seg.x === position.x && seg.y === position.y));
  return position;
};

// Check if two positions are equal
const positionsEqual = (a: Position, b: Position): boolean =>
  a.x === b.x && a.y === b.y;

// Get initial snake (starts in center, length 4, moving right)
const getInitialSnake = (): Position[] => {
  const centerX = Math.floor(GRID_WIDTH / 2);
  const centerY = Math.floor(GRID_HEIGHT / 2);
  return [
    { x: centerX, y: centerY }, // Head
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
    { x: centerX - 3, y: centerY }, // Tail
  ];
};

// Fixed initial food position (top-right area, away from snake)
const getInitialFood = (): Position => ({
  x: GRID_WIDTH - 5,
  y: 3,
});

export const SnakeGame: FC<SnakeGameProps> = ({ onExit, onSnakeMove }) => {
  // Game state
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [snake, setSnake] = useState<Position[]>(getInitialSnake);
  const [food, setFood] = useState<Position>(getInitialFood);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Load high score from localStorage on mount (client-side only)
  useEffect(() => {
    setHighScore(loadHighScore());
  }, []);

  // Refs for game loop
  const directionRef = useRef<Direction>(direction);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep direction ref in sync
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  // Notify parent of snake head position
  useEffect(() => {
    if (snake.length > 0 && onSnakeMove) {
      const head = snake[0];
      onSnakeMove(head.x + 1, head.y + 1);
    }
  }, [snake, onSnakeMove]);

  // Game tick logic
  const tick = useCallback(() => {
    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const dir = directionRef.current;

      // Calculate new head position
      let newHead: Position;
      switch (dir) {
        case "UP":
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case "DOWN":
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case "LEFT":
          newHead = { x: head.x - 1, y: head.y };
          break;
        case "RIGHT":
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_WIDTH ||
        newHead.y < 0 ||
        newHead.y >= GRID_HEIGHT
      ) {
        setGameState("GAME_OVER");
        return prevSnake;
      }

      // Check self collision (skip head)
      if (prevSnake.some((seg, i) => i > 0 && positionsEqual(seg, newHead))) {
        setGameState("GAME_OVER");
        return prevSnake;
      }

      // Check food collision
      const ateFood = positionsEqual(newHead, food);

      if (ateFood) {
        // Grow snake (don't remove tail)
        const newSnake = [newHead, ...prevSnake];
        setScore((prev) => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            saveHighScore(newScore);
          }
          return newScore;
        });
        setFood(getRandomPosition(newSnake));
        return newSnake;
      }

      // Move snake (add new head, remove tail)
      return [newHead, ...prevSnake.slice(0, -1)];
    });
  }, [food, highScore]);

  // Start/stop game loop based on game state
  useEffect(() => {
    if (gameState === "PLAYING") {
      gameLoopRef.current = setInterval(tick, TICK_INTERVAL);
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, tick]);

  // Reset game
  const resetGame = useCallback(() => {
    const initialSnake = getInitialSnake();
    setSnake(initialSnake);
    setFood(getRandomPosition(initialSnake));
    setDirection("RIGHT");
    directionRef.current = "RIGHT";
    setScore(0);
    setGameState("PLAYING");
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      // Direction changes (only when playing)
      if (gameState === "PLAYING") {
        const currentDir = directionRef.current;

        switch (e.key) {
          case "h":
          case "ArrowLeft":
            e.preventDefault();
            if (currentDir !== "RIGHT") {
              setDirection("LEFT");
            }
            break;
          case "j":
          case "ArrowDown":
            e.preventDefault();
            if (currentDir !== "UP") {
              setDirection("DOWN");
            }
            break;
          case "k":
          case "ArrowUp":
            e.preventDefault();
            if (currentDir !== "DOWN") {
              setDirection("UP");
            }
            break;
          case "l":
          case "ArrowRight":
            e.preventDefault();
            if (currentDir !== "LEFT") {
              setDirection("RIGHT");
            }
            break;
          case "p":
            e.preventDefault();
            setGameState("PAUSED");
            break;
          case "Escape":
            e.preventDefault();
            setGameState("PAUSED");
            break;
        }
        return;
      }

      // State-specific controls
      switch (e.key) {
        case " ":
          e.preventDefault();
          if (gameState === "IDLE" || gameState === "GAME_OVER") {
            resetGame();
          } else if (gameState === "PAUSED") {
            setGameState("PLAYING");
          }
          break;
        case "p":
          e.preventDefault();
          if (gameState === "PAUSED") {
            setGameState("PLAYING");
          }
          break;
        case "Escape":
          e.preventDefault();
          if (gameState === "PAUSED") {
            onExit();
          } else if (gameState === "IDLE" || gameState === "GAME_OVER") {
            onExit();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, resetGame, onExit]);

  // Render the game grid
  const renderGrid = () => {
    const rows: JSX.Element[] = [];

    // Top border - each cell is 1ch wide
    rows.push(
      <div key="border-top" className="flex justify-center">
        <span style={{ color: "var(--overlay1)" }}>
          {CHARS.borderTopLeft}
          {CHARS.borderHorizontal.repeat(GRID_WIDTH)}
          {CHARS.borderTopRight}
        </span>
      </div>,
    );

    // Grid rows
    for (let y = 0; y < GRID_HEIGHT; y++) {
      const cells: JSX.Element[] = [];

      for (let x = 0; x < GRID_WIDTH; x++) {
        const isHead = snake.length > 0 && snake[0].x === x && snake[0].y === y;
        const isBody = snake.some(
          (seg, i) => i > 0 && seg.x === x && seg.y === y,
        );
        const isFood = food.x === x && food.y === y;

        let char: string;
        let color: string;

        if (isHead) {
          char = CHARS.snakeHead;
          color = "var(--teal)";
        } else if (isBody) {
          char = CHARS.snakeBody;
          color = "var(--green)";
        } else if (isFood) {
          char = CHARS.food;
          color = "var(--red)";
        } else {
          char = CHARS.empty;
          color = "var(--surface0)";
        }

        cells.push(
          <span
            key={x}
            style={{
              color,
              display: "inline-block",
              width: "1ch",
              textAlign: "center",
            }}
          >
            {char}
          </span>,
        );
      }

      rows.push(
        <div key={`row-${y}`} className="flex justify-center">
          <span style={{ color: "var(--overlay1)" }}>
            {CHARS.borderVertical}
          </span>
          <span>{cells}</span>
          <span style={{ color: "var(--overlay1)" }}>
            {CHARS.borderVertical}
          </span>
        </div>,
      );
    }

    // Bottom border
    rows.push(
      <div key="border-bottom" className="flex justify-center">
        <span style={{ color: "var(--overlay1)" }}>
          {CHARS.borderBottomLeft}
          {CHARS.borderHorizontal.repeat(GRID_WIDTH)}
          {CHARS.borderBottomRight}
        </span>
      </div>,
    );

    return rows;
  };

  // Render status message based on game state
  const renderStatus = () => {
    const baseStyle = "text-center mt-4";

    switch (gameState) {
      case "IDLE":
        return (
          <div className={baseStyle}>
            <p style={{ color: "var(--text)" }}>
              SCORE: {score}
              <span style={{ color: "var(--surface2)" }}> · </span>
              HIGH: {highScore}
            </p>
            <p className="mt-2" style={{ color: "var(--subtext0)" }}>
              Press SPACE to start · ESC to exit
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--overlay0)" }}>
              Use h/j/k/l or arrow keys to move
            </p>
          </div>
        );
      case "PLAYING":
        return (
          <div className={baseStyle}>
            <p style={{ color: "var(--text)" }}>
              SCORE: {score}
              <span style={{ color: "var(--surface2)" }}> · </span>
              HIGH: {highScore}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--overlay0)" }}>
              P to pause · ESC to pause
            </p>
          </div>
        );
      case "PAUSED":
        return (
          <div className={baseStyle}>
            <p style={{ color: "var(--yellow)" }}>PAUSED</p>
            <p className="mt-2" style={{ color: "var(--subtext0)" }}>
              SPACE to resume · ESC to quit
            </p>
          </div>
        );
      case "GAME_OVER":
        return (
          <div className={baseStyle}>
            <p style={{ color: "var(--red)" }}>GAME OVER</p>
            <p className="mt-2" style={{ color: "var(--text)" }}>
              Score: {score}
              {score === highScore && score > 0 && (
                <span style={{ color: "var(--yellow)" }}> NEW HIGH!</span>
              )}
            </p>
            <p className="mt-2" style={{ color: "var(--subtext0)" }}>
              SPACE to restart · ESC to exit
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center overflow-auto p-4">
      {/* Game title */}
      <h1
        className="mb-4 font-bold text-xl"
        style={{ color: "var(--lavender)" }}
      >
        SNAKE
      </h1>

      {/* Game grid */}
      <div className="font-mono text-sm leading-tight">{renderGrid()}</div>

      {/* Status area */}
      {renderStatus()}
    </div>
  );
};

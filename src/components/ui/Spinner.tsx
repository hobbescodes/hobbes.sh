import { useEffect, useState } from "react";

import type { FC } from "react";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const INTERVAL_MS = 80;

interface SpinnerProps {
  /** Text to display next to the spinner */
  text?: string;
}

/**
 * ASCII art spinner using braille dots animation.
 * Cycles through frames to create a smooth rotating effect.
 */
export const Spinner: FC<SpinnerProps> = ({ text = "Loading..." }) => {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % FRAMES.length);
    }, INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex items-center gap-2"
      style={{ color: "var(--overlay1)" }}
    >
      <span className="font-mono text-lg">{FRAMES[frameIndex]}</span>
      <span>{text}</span>
    </div>
  );
};

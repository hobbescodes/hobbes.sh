import type { ReactNode } from "react";

/**
 * Virtual filesystem node
 */
export interface VFSNode {
  type: "file" | "directory";
  name: string;
  content?: string; // For files
  children?: VFSNode[]; // For directories
  hidden?: boolean; // For dotfiles
}

/**
 * Terminal execution context
 */
export interface TerminalContext {
  cwd: string; // Current working directory
  fs: VFSNode; // Virtual filesystem root
  env: Record<string, string>; // Environment variables
}

/**
 * Result from executing a command
 */
export interface CommandResult {
  output: string | ReactNode; // What to display
  clearScreen?: boolean; // For 'clear' command
  exit?: boolean; // For 'exit' command
  newCwd?: string; // For 'cd' command
  isError?: boolean; // Style as error
}

/**
 * Command definition
 */
export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  execute: (args: string[], context: TerminalContext) => CommandResult;
}

/**
 * Output line in terminal history
 */
export interface OutputLine {
  id: string;
  type: "prompt" | "output" | "error" | "welcome";
  content: string | ReactNode;
  prompt?: string; // The prompt that was shown (for prompt type)
}

/**
 * Terminal state
 * @knipignore - Reserved for future use when extracting state to context
 */
export interface TerminalState {
  history: OutputLine[]; // Command outputs
  inputBuffer: string; // Current input
  commandHistory: string[]; // Previous commands (for up/down)
  historyIndex: number; // Position in command history (-1 = current input)
  cwd: string; // Current directory
}

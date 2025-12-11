import { useCallback, useEffect, useRef, useState } from "react";

import { executeCommand } from "@/lib/terminal/commands";
import { virtualFS } from "@/lib/terminal/filesystem";

import type { FC } from "react";
import type { OutputLine, TerminalContext } from "@/lib/terminal/types";

interface InteractiveTerminalProps {
  onExit: () => void;
}

/**
 * Generate a unique ID for output lines
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Generate the prompt string
 */
function getPrompt(cwd: string): string {
  return `hobbescodes@website:${cwd}$ `;
}

/**
 * Welcome message shown on terminal start
 */
const WELCOME_MESSAGE = `Welcome to hobbescodes terminal! 🐯
Type 'help' for available commands, or 'exit' to leave.
`;

export const InteractiveTerminal: FC<InteractiveTerminalProps> = ({
  onExit,
}) => {
  // Terminal state
  const [history, setHistory] = useState<OutputLine[]>([
    { id: generateId(), type: "welcome", content: WELCOME_MESSAGE },
  ]);
  const [inputBuffer, setInputBuffer] = useState("");
  const [cwd, setCwd] = useState("~");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Refs
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when history changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to scroll when history.length changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history.length]);

  // Focus input on mount and click
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Handle command execution
  const handleSubmit = useCallback(() => {
    const trimmedInput = inputBuffer.trim();
    const prompt = getPrompt(cwd);

    // Add the command to history display
    const newLines: OutputLine[] = [
      {
        id: generateId(),
        type: "prompt",
        content: trimmedInput,
        prompt,
      },
    ];

    if (trimmedInput) {
      // Add to command history (for up/down navigation)
      setCommandHistory((prev) => [...prev, trimmedInput]);
      setHistoryIndex(-1);

      // Execute command
      const context: TerminalContext = {
        cwd,
        fs: virtualFS,
        env: {},
      };

      const result = executeCommand(trimmedInput, context);

      // Handle clear screen
      if (result.clearScreen) {
        setHistory([]);
        setInputBuffer("");
        return;
      }

      // Handle exit
      if (result.exit) {
        if (result.output) {
          newLines.push({
            id: generateId(),
            type: "output",
            content: result.output,
          });
        }
        setHistory((prev) => [...prev, ...newLines]);
        // Delay exit slightly so user sees the goodbye message
        setTimeout(onExit, 500);
        setInputBuffer("");
        return;
      }

      // Handle directory change
      if (result.newCwd !== undefined) {
        setCwd(result.newCwd);
      }

      // Add output if any
      if (result.output) {
        newLines.push({
          id: generateId(),
          type: result.isError ? "error" : "output",
          content: result.output,
        });
      }
    }

    setHistory((prev) => [...prev, ...newLines]);
    setInputBuffer("");
  }, [inputBuffer, cwd, onExit]);

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          handleSubmit();
          break;

        case "ArrowUp":
          e.preventDefault();
          if (commandHistory.length > 0) {
            const newIndex =
              historyIndex === -1
                ? commandHistory.length - 1
                : Math.max(0, historyIndex - 1);
            setHistoryIndex(newIndex);
            setInputBuffer(commandHistory[newIndex]);
          }
          break;

        case "ArrowDown":
          e.preventDefault();
          if (historyIndex !== -1) {
            const newIndex = historyIndex + 1;
            if (newIndex >= commandHistory.length) {
              setHistoryIndex(-1);
              setInputBuffer("");
            } else {
              setHistoryIndex(newIndex);
              setInputBuffer(commandHistory[newIndex]);
            }
          }
          break;

        case "c":
          // Ctrl+C to cancel current input
          if (e.ctrlKey) {
            e.preventDefault();
            setInputBuffer("");
            setHistoryIndex(-1);
            setHistory((prev) => [
              ...prev,
              {
                id: generateId(),
                type: "prompt",
                content: "^C",
                prompt: getPrompt(cwd),
              },
            ]);
          }
          break;

        case "l":
          // Ctrl+L to clear screen
          if (e.ctrlKey) {
            e.preventDefault();
            setHistory([]);
          }
          break;

        case "Escape":
          // Double-tap or hold Escape could exit, but for now just ignore
          // The exit command is the primary way out
          break;
      }
    },
    [handleSubmit, commandHistory, historyIndex, cwd],
  );

  return (
    <div
      ref={terminalRef}
      className="flex h-full flex-col overflow-auto p-4 font-mono text-sm"
      style={{ backgroundColor: "var(--terminal-bg)" }}
      onClick={focusInput}
    >
      {/* Output history */}
      <div className="flex-1">
        {history.map((line) => (
          <div key={line.id} className="whitespace-pre-wrap break-words">
            {line.type === "prompt" && (
              <span>
                <span style={{ color: "var(--green)" }}>{line.prompt}</span>
                <span style={{ color: "var(--text)" }}>{line.content}</span>
              </span>
            )}
            {line.type === "output" && (
              <span style={{ color: "var(--text)" }}>{line.content}</span>
            )}
            {line.type === "error" && (
              <span style={{ color: "var(--red)" }}>{line.content}</span>
            )}
            {line.type === "welcome" && (
              <span style={{ color: "var(--blue)" }}>{line.content}</span>
            )}
          </div>
        ))}
      </div>

      {/* Input line */}
      <div className="flex items-center">
        <span style={{ color: "var(--green)" }}>{getPrompt(cwd)}</span>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputBuffer}
            onChange={(e) => setInputBuffer(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border-none bg-transparent p-0 outline-none"
            style={{
              color: "var(--text)",
              caretColor: "var(--cursor)",
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};

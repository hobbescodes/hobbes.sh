import { HACKERMAN, WHOAMI, neofetch, tigerSay } from "@/lib/ascii/tiger";
import { normalizePath, resolvePath } from "./filesystem";

import type { Command, CommandResult, TerminalContext } from "./types";

/**
 * Fortune quotes for the fortune command
 */
const FORTUNES = [
  "The best code is no code at all.",
  "It works on my machine. ¯\\_(ツ)_/¯",
  "There are only two hard things in computer science: cache invalidation and naming things.",
  "99 little bugs in the code, 99 little bugs. Take one down, patch it around, 127 little bugs in the code.",
  "A tiger doesn't lose sleep over the opinion of sheep.",
  "In a world of tabs, be a space. Or don't. It's your life.",
  "The factory must grow.",
  "Have you tried turning it off and on again?",
  "// TODO: Write a better fortune",
  "sudo make me a sandwich",
  "There's no place like 127.0.0.1",
  "I don't always test my code, but when I do, I do it in production.",
  "Keep calm and git commit.",
  "A day without sunshine is like, you know, night.",
  "Coffee: because adulting is hard.",
];

/**
 * All available commands
 */
const commands: Command[] = [
  // === FILESYSTEM COMMANDS ===
  {
    name: "ls",
    description: "List directory contents",
    usage: "ls [-a] [directory]",
    execute: (args, ctx): CommandResult => {
      const showHidden = args.includes("-a") || args.includes("-la");
      const pathArg = args.find((a) => !a.startsWith("-")) || ".";

      const node = resolvePath(ctx.fs, ctx.cwd, pathArg);

      if (!node) {
        return {
          output: `ls: cannot access '${pathArg}': No such file or directory`,
          isError: true,
        };
      }

      if (node.type === "file") {
        return { output: node.name };
      }

      const children = node.children || [];
      const visible = showHidden
        ? children
        : children.filter((c) => !c.hidden && !c.name.startsWith("."));

      if (visible.length === 0) {
        return { output: "" };
      }

      const entries = visible
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => {
          if (c.type === "directory") {
            return `${c.name}/`;
          }
          return c.name;
        });

      return { output: entries.join("  ") };
    },
  },
  {
    name: "cd",
    description: "Change directory",
    usage: "cd [directory]",
    execute: (args, ctx): CommandResult => {
      const path = args[0] || "~";

      if (path === "-") {
        // Could implement previous directory, but for now just go home
        return { newCwd: "~", output: "" };
      }

      const node = resolvePath(ctx.fs, ctx.cwd, path);

      if (!node) {
        return {
          output: `cd: no such file or directory: ${path}`,
          isError: true,
        };
      }

      if (node.type !== "directory") {
        return { output: `cd: not a directory: ${path}`, isError: true };
      }

      const newCwd = normalizePath(ctx.cwd, path);
      return { newCwd, output: "" };
    },
  },
  {
    name: "pwd",
    description: "Print working directory",
    execute: (_args, ctx): CommandResult => {
      return { output: ctx.cwd };
    },
  },
  {
    name: "cat",
    description: "Display file contents",
    usage: "cat <file>",
    execute: (args, ctx): CommandResult => {
      if (args.length === 0) {
        return { output: "cat: missing file operand", isError: true };
      }

      const path = args[0];
      const node = resolvePath(ctx.fs, ctx.cwd, path);

      if (!node) {
        return {
          output: `cat: ${path}: No such file or directory`,
          isError: true,
        };
      }

      if (node.type === "directory") {
        return { output: `cat: ${path}: Is a directory`, isError: true };
      }

      return { output: node.content || "" };
    },
  },
  {
    name: "tree",
    description: "Display directory tree",
    execute: (_args, ctx): CommandResult => {
      const lines: string[] = [];

      function walk(
        node: {
          name: string;
          type: string;
          children?: (typeof node)[];
          hidden?: boolean;
        },
        prefix: string,
        isLast: boolean,
      ) {
        const connector = isLast ? "└── " : "├── ";
        const name = node.type === "directory" ? `${node.name}/` : node.name;
        lines.push(prefix + connector + name);

        if (node.type === "directory" && node.children) {
          const visible = node.children.filter(
            (c) => !c.hidden && !c.name.startsWith("."),
          );
          visible.forEach((child, i) => {
            const newPrefix = prefix + (isLast ? "    " : "│   ");
            walk(child, newPrefix, i === visible.length - 1);
          });
        }
      }

      const current = resolvePath(ctx.fs, ctx.cwd, ".");
      if (!current || current.type !== "directory") {
        return { output: "tree: not a directory", isError: true };
      }

      lines.push(".");
      const children = (current.children || []).filter(
        (c) => !c.hidden && !c.name.startsWith("."),
      );
      children.forEach((child, i) => {
        walk(child, "", i === children.length - 1);
      });

      return { output: lines.join("\n") };
    },
  },

  // === FUN COMMANDS ===
  {
    name: "whoami",
    description: "Display current user",
    execute: (): CommandResult => {
      return { output: WHOAMI };
    },
  },
  {
    name: "neofetch",
    description: "Display system information",
    execute: (): CommandResult => {
      return { output: neofetch() };
    },
  },
  {
    name: "cowsay",
    aliases: ["tigersay"],
    description: "Tiger says your message",
    usage: "cowsay <message>",
    execute: (args): CommandResult => {
      const message = args.join(" ") || "meow?";
      return { output: tigerSay(message) };
    },
  },
  {
    name: "fortune",
    description: "Display a random fortune",
    execute: (): CommandResult => {
      const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
      return { output: fortune };
    },
  },
  {
    name: "date",
    description: "Display current date and time",
    execute: (): CommandResult => {
      const now = new Date();
      return { output: now.toString() };
    },
  },
  {
    name: "echo",
    description: "Print text",
    usage: "echo [text...]",
    execute: (args): CommandResult => {
      return { output: args.join(" ") };
    },
  },
  {
    name: "clear",
    description: "Clear the terminal",
    execute: (): CommandResult => {
      return { output: "", clearScreen: true };
    },
  },
  {
    name: "help",
    description: "List available commands",
    execute: (): CommandResult => {
      const helpText = `Available commands:

Filesystem:
  ls [-a]        List directory contents
  cd <dir>       Change directory
  pwd            Print working directory
  cat <file>     Display file contents
  tree           Display directory tree

Fun:
  whoami         Display current user
  neofetch       Display system information
  cowsay <msg>   Tiger says your message
  fortune        Display a random fortune
  date           Display current date
  echo <text>    Print text

Other:
  clear          Clear the terminal
  help           Show this help
  exit           Exit terminal mode

Type 'ls' to explore, or 'cat readme.txt' to get started!`;

      return { output: helpText };
    },
  },
  {
    name: "exit",
    aliases: ["quit", "q"],
    description: "Exit terminal mode",
    execute: (): CommandResult => {
      return { output: "Goodbye! 🐯", exit: true };
    },
  },

  // === EASTER EGGS ===
  {
    name: "sudo",
    description: "Execute as superuser",
    execute: (args): CommandResult => {
      if (args.join(" ").toLowerCase().includes("make me a sandwich")) {
        return { output: "🥪 Here's your sandwich." };
      }
      return { output: "Nice try, but tigers don't need sudo. 🐯" };
    },
  },
  {
    name: "rm",
    description: "Remove files",
    execute: (args): CommandResult => {
      if (args.includes("-rf") && (args.includes("/") || args.includes("~"))) {
        return {
          output:
            "Nice try! But I'm not going to let you do that. 🐯\nThis is a virtual filesystem anyway...",
        };
      }
      return { output: "rm: this is a read-only virtual filesystem" };
    },
  },
  {
    name: "vim",
    aliases: ["nvim", "vi"],
    description: "Open vim",
    execute: (): CommandResult => {
      return {
        output:
          "You're already in vim... sort of. 🐯\n(This whole website is vim-inspired!)",
      };
    },
  },
  {
    name: "emacs",
    description: "Open emacs",
    execute: (): CommandResult => {
      return {
        output:
          "Emacs? We don't do that here. 🐯\n(j/k, use what makes you happy)",
      };
    },
  },
  {
    name: "hackerman",
    description: "???",
    execute: (): CommandResult => {
      return { output: HACKERMAN };
    },
  },
  {
    name: "ping",
    description: "Ping a host",
    execute: (args): CommandResult => {
      const host = args[0] || "localhost";
      return {
        output: `PING ${host}: 64 bytes from ${host}: time=0.042ms\n🐯 pong!`,
      };
    },
  },
  {
    name: "curl",
    aliases: ["wget"],
    description: "Transfer data",
    execute: (args): CommandResult => {
      const url = args[0] || "http://example.com";
      return {
        output: `Fetching ${url}...\n\n<html><body><h1>🐯 meow</h1></body></html>`,
      };
    },
  },
  {
    name: "make",
    description: "Build stuff",
    execute: (args): CommandResult => {
      if (args[0] === "love") {
        return {
          output:
            "make: *** No rule to make target 'love'. Stop.\n(But you're loved anyway! 💙)",
        };
      }
      if (args[0] === "coffee") {
        return {
          output: "☕ Brewing coffee...\n\nDone! Here's your coffee. ☕",
        };
      }
      return { output: `make: Nothing to be done for '${args[0] || "all"}'.` };
    },
  },
  {
    name: "man",
    description: "Manual pages",
    execute: (args): CommandResult => {
      if (!args[0]) {
        return { output: "What manual page do you want?\nTry 'help' instead!" };
      }
      return {
        output: `No manual entry for ${args[0]}\n\n(This is a mini terminal, try 'help')`,
      };
    },
  },
  {
    name: "touch",
    aliases: ["mkdir"],
    description: "Create files/directories",
    execute: (): CommandResult => {
      return {
        output:
          "This is a read-only virtual filesystem.\n(But I appreciate the effort! 🐯)",
      };
    },
  },
];

/**
 * Find a command by name or alias
 */
export function findCommand(name: string): Command | undefined {
  const lower = name.toLowerCase();
  return commands.find(
    (cmd) => cmd.name === lower || cmd.aliases?.includes(lower),
  );
}

/**
 * Execute a command string
 */
export function executeCommand(
  input: string,
  context: TerminalContext,
): CommandResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { output: "" };
  }

  // Parse command and arguments
  const parts = trimmed.split(/\s+/);
  const cmdName = parts[0];
  const args = parts.slice(1);

  // Find and execute command
  const command = findCommand(cmdName);

  if (!command) {
    // Check for fork bomb easter egg
    if (trimmed.includes(":(){ :|:& };:")) {
      return {
        output:
          "🚨 Fork bomb detected!\nNice try, but this terminal is bomb-proof. 🐯",
      };
    }

    return {
      output: `${cmdName}: command not found\nType 'help' for available commands.`,
      isError: true,
    };
  }

  return command.execute(args, context);
}

/**
 * Get all visible commands for tab completion
 * @knipignore - Reserved for future tab completion feature
 */
export function getAllCommands(): string[] {
  return commands.map((cmd) => cmd.name).sort();
}

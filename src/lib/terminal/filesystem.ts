import type { VFSNode } from "./types";

/**
 * Virtual filesystem for the terminal easter egg
 *
 * Structure:
 * ~/
 * ├── about/
 * │   ├── bio.txt
 * │   ├── location.txt
 * │   └── contact.txt
 * ├── skills/
 * │   ├── typescript.txt
 * │   ├── rust.txt
 * │   ├── react.txt
 * │   ├── neovim.txt
 * │   └── go.txt
 * ├── projects/
 * │   └── ... (project files)
 * ├── interests/
 * │   ├── gaming.txt
 * │   ├── music.txt
 * │   ├── coffee.txt
 * │   └── mechanical-keyboards.txt
 * ├── .secrets/
 * │   ├── konami.txt
 * │   └── .plan
 * ├── readme.txt
 * └── .bashrc
 */

// Skill level bar generator
function skillBar(level: number, label: string): string {
  const filled = Math.round(level / 5);
  const empty = 20 - filled;
  return `${"▓".repeat(filled)}${"░".repeat(empty)} ${level}%\n${label}`;
}

export const virtualFS: VFSNode = {
  type: "directory",
  name: "~",
  children: [
    {
      type: "directory",
      name: "about",
      children: [
        {
          type: "file",
          name: "bio.txt",
          content: `# hobbescodes

A tiger who writes code.

I'm a software developer who loves building tools
and experiences that make developers' lives better.

When I'm not coding, you'll find me exploring new
programming languages, tinkering with my Neovim
config, or enjoying a good cup of coffee.`,
        },
        {
          type: "file",
          name: "location.txt",
          content: `📍 Location: The Internet

Timezone: Somewhere between UTC-8 and UTC+9
(it depends on the project)

Remote-first, async-friendly.`,
        },
        {
          type: "file",
          name: "contact.txt",
          content: `📬 Contact

GitHub:   github.com/hobbescodes
Twitter:  @hobbescodes
Email:    hello@hobbescodes.dev

Feel free to reach out!`,
        },
      ],
    },
    {
      type: "directory",
      name: "skills",
      children: [
        {
          type: "file",
          name: "typescript.txt",
          content: skillBar(
            90,
            "My daily driver. Types make everything better.",
          ),
        },
        {
          type: "file",
          name: "rust.txt",
          content: skillBar(
            65,
            "Learning and loving it. Memory safety is beautiful.",
          ),
        },
        {
          type: "file",
          name: "react.txt",
          content: skillBar(
            85,
            "Building UIs since 2018. Hooks changed everything.",
          ),
        },
        {
          type: "file",
          name: "neovim.txt",
          content: skillBar(80, "I use Neovim btw. Lua config, of course."),
        },
        {
          type: "file",
          name: "go.txt",
          content: skillBar(70, "For when I need speed and simplicity."),
        },
      ],
    },
    {
      type: "directory",
      name: "projects",
      children: [
        {
          type: "file",
          name: "this-website.txt",
          content: `# hobbescodes.dev

A terminal-inspired personal website.

Built with:
- TanStack Start (React + SSR)
- Tailwind CSS v4
- Catppuccin color scheme
- Vim-style keybindings
- Oil.nvim-style navigation

You're using it right now! 🐯`,
        },
        {
          type: "file",
          name: "readme.txt",
          content: `Check out my projects at /projects

Or run 'exit' and navigate there!`,
        },
      ],
    },
    {
      type: "directory",
      name: "interests",
      children: [
        {
          type: "file",
          name: "gaming.txt",
          content: `🎮 Gaming

Current favorites:
- Factorio (the factory must grow)
- Satisfactory
- Dwarf Fortress
- Roguelikes

I like games where you build systems.`,
        },
        {
          type: "file",
          name: "music.txt",
          content: `🎵 Music

Coding playlist essentials:
- Lo-fi beats
- Synthwave
- Post-rock
- Video game OSTs

Music helps me get in the zone.`,
        },
        {
          type: "file",
          name: "coffee.txt",
          content: `☕ Coffee

Fuel for code.

Preferences:
- Pour over > French press
- Medium roast
- Black, no sugar
- Local roasters when possible

Current daily driver: V60`,
        },
        {
          type: "file",
          name: "mechanical-keyboards.txt",
          content: `⌨️  Mechanical Keyboards

Because of course.

Current setup:
- Layout: 65%
- Switches: Tactile (don't @ me)
- Keycaps: MT3 profile
- Sound: Thock > Click

Yes, I have more than one keyboard.
No, I don't need another one.
...Maybe just one more.`,
        },
      ],
    },
    {
      type: "directory",
      name: ".secrets",
      hidden: true,
      children: [
        {
          type: "file",
          name: "konami.txt",
          content: `↑ ↑ ↓ ↓ ← → ← → B A

You found the secret! 🎉

Here's a cookie: 🍪`,
        },
        {
          type: "file",
          name: ".plan",
          hidden: true,
          content: `No plans. Just vibes.

(Old school Unix users will appreciate this)`,
        },
      ],
    },
    {
      type: "file",
      name: "readme.txt",
      content: `Welcome to hobbescodes terminal! 🐯

This is a virtual filesystem representing
my digital home. Feel free to explore!

Try these commands:
  ls        - List files
  cd <dir>  - Change directory  
  cat <f>   - Read a file
  whoami    - Who am I?
  neofetch  - System info
  help      - All commands

Have fun exploring!`,
    },
    {
      type: "file",
      name: ".bashrc",
      hidden: true,
      content: `# ~/.bashrc
# Tiger mode activated 🐯

alias vim="nvim"
alias please="sudo"
export EDITOR="nvim"
export TIGER_MODE="always"

# The terminal is not a place, it's a lifestyle.`,
    },
  ],
};

/**
 * Resolve a path to a VFS node
 */
export function resolvePath(
  fs: VFSNode,
  cwd: string,
  path: string,
): VFSNode | null {
  // Normalize the path
  let targetPath: string;

  if (path.startsWith("~")) {
    targetPath = path;
  } else if (path.startsWith("/")) {
    targetPath = `~${path}`;
  } else {
    // Relative path
    targetPath = `${cwd}/${path}`;
  }

  // Handle .. and .
  const parts = targetPath.split("/").filter(Boolean);
  const resolved: string[] = [];

  for (const part of parts) {
    if (part === "..") {
      if (resolved.length > 1) {
        resolved.pop();
      }
    } else if (part !== ".") {
      resolved.push(part);
    }
  }

  // Navigate to the node
  if (resolved.length === 0 || (resolved.length === 1 && resolved[0] === "~")) {
    return fs;
  }

  let current: VFSNode = fs;

  // Skip the ~ at the start
  for (let i = 1; i < resolved.length; i++) {
    const part = resolved[i];
    if (current.type !== "directory" || !current.children) {
      return null;
    }

    const child = current.children.find((c) => c.name === part);
    if (!child) {
      return null;
    }

    current = child;
  }

  return current;
}

/**
 * Get the absolute path for a resolved node path
 */
export function normalizePath(cwd: string, path: string): string {
  if (path.startsWith("~")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `~${path}`;
  }

  // Relative path
  const base = cwd === "~" ? "~" : cwd;
  const parts = `${base}/${path}`.split("/").filter(Boolean);
  const resolved: string[] = [];

  for (const part of parts) {
    if (part === "..") {
      if (resolved.length > 1) {
        resolved.pop();
      }
    } else if (part !== ".") {
      resolved.push(part);
    }
  }

  return resolved.join("/") || "~";
}

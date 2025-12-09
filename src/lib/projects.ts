import type { RouteEntry } from "@/types";

/**
 * Project data structure - designed for GitHub API compatibility
 */
export interface Project {
  name: string;
  description: string;
  url: string;
  homepage?: string;
  language: string;
  stars: number;
  forks: number;
  topics: string[];
  updatedAt: string;
}

/**
 * Mock project data - structured for GitHub API compatibility
 * This is the single source of truth for all project data
 */
export const projects: Project[] = [
  {
    name: "terminal-website",
    description:
      "A terminal-inspired personal website built with TanStack Start",
    url: "https://github.com/hobbescodes/terminal-website",
    homepage: "https://hobbescodes.dev",
    language: "TypeScript",
    stars: 42,
    forks: 5,
    topics: ["react", "typescript", "terminal", "portfolio"],
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    name: "nvim-config",
    description: "My Neovim configuration with LSP, Treesitter, and more",
    url: "https://github.com/hobbescodes/nvim-config",
    language: "Lua",
    stars: 128,
    forks: 23,
    topics: ["neovim", "lua", "dotfiles"],
    updatedAt: "2024-11-15T00:00:00Z",
  },
  {
    name: "rust-cli-tools",
    description: "A collection of useful CLI tools written in Rust",
    url: "https://github.com/hobbescodes/rust-cli-tools",
    language: "Rust",
    stars: 89,
    forks: 12,
    topics: ["rust", "cli", "tools"],
    updatedAt: "2024-10-20T00:00:00Z",
  },
];

/**
 * Get a project by its slug (name)
 */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.name === slug);
}

/**
 * Convert projects to RouteEntry format for OilEntry component
 */
export function getProjectRouteEntries(): RouteEntry[] {
  return projects.map((p) => ({
    name: p.name,
    displayName: `${p.name}.md`,
    type: "file",
    path: `/projects/${p.name}`,
  }));
}

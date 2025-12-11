// Telescope mode types and data

export type TelescopeMode =
  | "find_files"
  | "buffers"
  | "marks"
  | "commands"
  | "help_tags"
  | "recent"
  | "colorscheme";

export interface TelescopeItem {
  id: string;
  displayName: string;
  description?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

// Mode aliases for command parsing
export const TELESCOPE_ALIASES: Record<string, TelescopeMode> = {
  find_files: "find_files",
  ff: "find_files",
  files: "find_files",
  buffers: "buffers",
  buf: "buffers",
  marks: "marks",
  m: "marks",
  commands: "commands",
  cmd: "commands",
  help_tags: "help_tags",
  help: "help_tags",
  recent: "recent",
  oldfiles: "recent",
  history: "recent",
  colorscheme: "colorscheme",
  cs: "colorscheme",
  themes: "colorscheme",
};

// Mode display titles
export const TELESCOPE_TITLES: Record<TelescopeMode, string> = {
  find_files: "Find Files",
  buffers: "Buffers",
  marks: "Marks",
  commands: "Commands",
  help_tags: "Help Tags",
  recent: "Recent Files",
  colorscheme: "Colorscheme",
};

// Command palette data
export const COMMANDS: TelescopeItem[] = [
  { id: "q", displayName: ":q", description: "Go to home page" },
  { id: "e", displayName: ":e <path>", description: "Open file by path" },
  { id: "help", displayName: ":help", description: "Show help overlay" },
  { id: "theme", displayName: ":theme", description: "Open theme picker" },
  {
    id: "theme-arg",
    displayName: ":theme <name>",
    description: "Set colorscheme directly",
  },
  { id: "marks", displayName: ":marks", description: "Show marks overlay" },
  {
    id: "delmarks",
    displayName: ":delmarks <a-z>",
    description: "Delete a mark",
  },
  {
    id: "delmarks!",
    displayName: ":delmarks!",
    description: "Delete all marks",
  },
  { id: "ls", displayName: ":ls", description: "Show buffer list" },
  { id: "b", displayName: ":b <n>", description: "Switch to buffer by number" },
  { id: "bd", displayName: ":bd", description: "Close current buffer" },
  { id: "bda", displayName: ":bda", description: "Close all buffers" },
  { id: "recent", displayName: ":recent", description: "Show recent files" },
  { id: "snake", displayName: ":snake", description: "Play snake game" },
  {
    id: "term",
    displayName: ":term",
    description: "Open interactive terminal",
  },
  { id: "sane", displayName: ":sane", description: "Set dark theme (ghostty)" },
  {
    id: "insane",
    displayName: ":insane",
    description: "Set light theme (latte)",
  },
  {
    id: "telescope",
    displayName: ":Tel <mode>",
    description: "Open telescope picker",
  },
];

// Help tags data - maps to help overlay sections
export const HELP_TAGS: TelescopeItem[] = [
  {
    id: "navigation",
    displayName: "Navigation",
    description: "j/k to move, Enter to open, - for parent, gx for links",
  },
  {
    id: "buffers",
    displayName: "Buffers",
    description: "b{1-9} switch, b# alternate, :ls list, :bd close",
  },
  {
    id: "modes",
    displayName: "Modes",
    description: ": command, / search, ? help, Esc normal",
  },
  {
    id: "marks",
    displayName: "Marks",
    description: "m{a-z} set, '{a-z} jump, :marks list, :delmarks! clear",
  },
  {
    id: "commands",
    displayName: "Commands",
    description: ":q home, :e open, :theme colors, :recent history",
  },
  {
    id: "projects",
    displayName: "Projects",
    description: "Enter preview, ^a l/h focus, ^a x close",
  },
  {
    id: "telescope",
    displayName: "Telescope",
    description: ":Tel ff files, :Tel buf buffers, :Tel cmd commands",
  },
];

// Colorscheme metadata for preview
export const COLORSCHEME_META: Record<
  string,
  { label: string; description: string; type: "dark" | "light" }
> = {
  ghostty: {
    label: "Ghostty",
    description: "Custom dark theme with deep purple background",
    type: "dark",
  },
  mocha: {
    label: "Catppuccin Mocha",
    description: "Warm dark theme with pastel accents",
    type: "dark",
  },
  macchiato: {
    label: "Catppuccin Macchiato",
    description: "Medium-dark theme with muted tones",
    type: "dark",
  },
  frappe: {
    label: "Catppuccin Frappé",
    description: "Soft dark theme with cool undertones",
    type: "dark",
  },
  latte: {
    label: "Catppuccin Latte",
    description: "Light theme with warm pastels",
    type: "light",
  },
};

/**
 * Parse telescope command and return mode
 * Returns null if not a telescope command or invalid mode
 */
export function parseTelescopeCommand(
  cmd: string,
): { mode: TelescopeMode } | { error: string } | null {
  const teleMatch = cmd.match(/^(?:Telescope|Tel|Tele)\s*(.*)$/i);
  if (!teleMatch) return null;

  const modeArg = teleMatch[1].trim().toLowerCase();

  if (!modeArg) {
    // No mode specified - default to find_files
    return { mode: "find_files" };
  }

  const mode = TELESCOPE_ALIASES[modeArg];
  if (mode) {
    return { mode };
  }

  return { error: `Unknown telescope mode: ${modeArg}` };
}

/**
 * Filter items by query
 */
export function filterTelescopeItems(
  items: TelescopeItem[],
  query: string,
): TelescopeItem[] {
  if (!query.trim()) return items;

  const lowerQuery = query.toLowerCase();
  return items.filter(
    (item) =>
      item.displayName.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery),
  );
}

// Theme types
export type Colorscheme =
  | "latte"
  | "frappe"
  | "macchiato"
  | "mocha"
  | "ghostty";

export const COLORSCHEMES: Colorscheme[] = [
  "ghostty",
  "mocha",
  "macchiato",
  "frappe",
  "latte",
];

export const COLORSCHEME_META: Record<
  Colorscheme,
  { label: string; description: string; background: string }
> = {
  ghostty: {
    label: "👻 ghostty",
    description: "Darkest (default)",
    background: "#08071c",
  },
  mocha: { label: "mocha", description: "Dark", background: "#1e1e2e" },
  macchiato: {
    label: "macchiato",
    description: "Medium Dark",
    background: "#24273a",
  },
  frappe: {
    label: "frappé",
    description: "Light Dark",
    background: "#303446",
  },
  latte: { label: "latte", description: "Light", background: "#eff1f5" },
};

// Navigation types
export interface RouteEntry {
  name: string;
  displayName: string;
  type: "directory" | "file";
  path: string;
  children?: RouteEntry[];
}

// Blog types
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string[];
  readingTime?: string;
}

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

// Project types
export interface Project {
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  forks: number;
  topics: string[];
  updatedAt: string;
}

export interface ProjectWithReadme extends Project {
  readme: string;
}

import { getAllBlogPosts } from "@/lib/content";
import {
  PROJECT_CATEGORIES,
  getAllFeaturedRepos,
  normalizeRepoConfig,
} from "@/lib/projects.config";

import type { RouteEntry } from "@/types";

export const routeTree: RouteEntry = {
  name: "hobbescodes",
  displayName: "~/",
  type: "directory",
  path: "/",
  children: [
    { name: "home", displayName: "home.md", type: "file", path: "/" },
    { name: "about", displayName: "about.md", type: "file", path: "/about" },
    {
      name: "contact",
      displayName: "contact.md",
      type: "file",
      path: "/contact",
    },
    {
      name: "projects",
      displayName: "projects/",
      type: "directory",
      path: "/projects",
      children: PROJECT_CATEGORIES.map((category) => ({
        name: category,
        displayName: `${category}/`,
        type: "directory" as const,
        path: `/projects/${category}`,
      })),
    },
    {
      name: "blog",
      displayName: "blog/",
      type: "directory",
      path: "/blog",
      children: [], // Populated dynamically
    },
  ],
};

/**
 * Get parent path
 */
export function getParentPath(path: string): string {
  if (path === "/") return "/";
  const segments = path.split("/").filter(Boolean);
  segments.pop();
  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

// ============================================
// Search-related types and functions
// ============================================

export interface SearchableRoute {
  path: string;
  displayName: string;
  type: "file" | "directory";
  title?: string;
  description?: string;
  tags?: string[];
  date?: string;
  readingTime?: string;
}

/**
 * Get all searchable routes flattened from the route tree
 * This includes static routes and will be extended with dynamic content
 */
export function getAllRoutes(): SearchableRoute[] {
  const routes: SearchableRoute[] = [];

  // Add static routes from routeTree
  function flattenRoutes(entry: RouteEntry, _parentPath: string = "") {
    routes.push({
      path: entry.path,
      displayName: entry.displayName,
      type: entry.type,
    });

    if (entry.children) {
      for (const child of entry.children) {
        flattenRoutes(child, entry.path);
      }
    }
  }

  // Start from children to skip root
  for (const child of routeTree.children || []) {
    flattenRoutes(child);
  }

  // Add project entries with their metadata
  // These are imported dynamically to avoid circular deps
  const projectRoutes = getProjectSearchRoutes();
  routes.push(...projectRoutes);

  // Add blog entries with their metadata
  const blogRoutes = getBlogSearchRoutes();
  routes.push(...blogRoutes);

  return routes;
}

/**
 * Get searchable routes for projects
 * Uses the curated list from projects.config.ts
 * Note: Full project metadata requires async GitHub API calls,
 * so we only provide basic route info for search
 */
function getProjectSearchRoutes(): SearchableRoute[] {
  const allRepos = getAllFeaturedRepos();
  return allRepos.map((config) => {
    const { repo, displayName } = normalizeRepoConfig(config);
    const name = displayName ?? repo;
    return {
      path: `/projects/${repo}`,
      displayName: `${repo}.md`,
      type: "file" as const,
      title: name,
      description: `Project: ${name}`,
    };
  });
}

/**
 * Get searchable routes for blog posts
 */
function getBlogSearchRoutes(): SearchableRoute[] {
  const posts = getAllBlogPosts();

  return posts.map((post) => ({
    path: `/blog/${post.slug}`,
    displayName: `${post.slug}.md`,
    type: "file" as const,
    title: post.title,
    description: post.description,
    tags: post.tags,
    date: post.date,
    readingTime: post.readingTime,
  }));
}

/**
 * Search routes by query
 */
export function searchRoutes(query: string): SearchableRoute[] {
  if (!query.trim()) return [];

  const allRoutes = getAllRoutes();
  const lowerQuery = query.toLowerCase();

  return allRoutes.filter((route) => {
    if (route.displayName.toLowerCase().includes(lowerQuery)) return true;
    if (route.path.toLowerCase().includes(lowerQuery)) return true;
    if (route.title?.toLowerCase().includes(lowerQuery)) return true;
    if (route.description?.toLowerCase().includes(lowerQuery)) return true;
    return false;
  });
}

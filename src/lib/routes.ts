import { getAllBlogPosts } from "@/lib/content";
import { projects } from "@/lib/projects";

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
      children: [], // Populated dynamically
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
 * Uses the centralized projects data from lib/projects.ts
 */
function getProjectSearchRoutes(): SearchableRoute[] {
  return projects.map((p) => ({
    path: `/projects/${p.name}`,
    displayName: `${p.name}.md`,
    type: "file" as const,
    title: p.name,
    description: p.description,
  }));
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

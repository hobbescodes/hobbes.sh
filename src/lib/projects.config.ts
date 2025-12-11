/**
 * GitHub Projects Configuration
 *
 * This file contains the curated list of repositories to display
 * on the projects page, organized by category.
 */

/**
 * Default GitHub username for repos without explicit owner
 */
export const DEFAULT_GITHUB_OWNER = "hobbescodes";

/**
 * Project categories
 * - "owned": Personal projects owned by DEFAULT_GITHUB_OWNER
 * - "omnidotdev": Projects from the omnidotdev organization
 * - "contrib": Open source contributions to external projects
 */
export type ProjectCategory = "owned" | "omnidotdev" | "contrib";

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "owned",
  "omnidotdev",
  "contrib",
];

/**
 * A featured repository - can be just a name (uses DEFAULT_GITHUB_OWNER)
 * or an object with explicit owner and repo name
 */
export interface FeaturedRepoConfig {
  owner: string;
  repo: string;
  /** Optional display name override */
  displayName?: string;
}

/**
 * Curated list of repositories to feature on the projects page, organized by category.
 * - String: repo name owned by DEFAULT_GITHUB_OWNER
 * - Object: { owner, repo } for external repos or OSS contributions
 */
export const featuredRepos: Record<
  ProjectCategory,
  (string | FeaturedRepoConfig)[]
> = {
  owned: ["hobbes.sh", "tangen"],
  omnidotdev: [
    { owner: "omnidotdev", repo: "rdk", displayName: "RDK" },
    { owner: "omnidotdev", repo: "backfeed-app", displayName: "Backfeed" },
    { owner: "omnidotdev", repo: "garden", displayName: "Garden" },
  ],
  contrib: [{ owner: "rockorager", repo: "prise" }],
};

/**
 * Normalize repo config to always have owner/repo
 */
export function normalizeRepoConfig(
  config: string | FeaturedRepoConfig,
): FeaturedRepoConfig {
  if (typeof config === "string") {
    return { owner: DEFAULT_GITHUB_OWNER, repo: config };
  }
  return config;
}

/**
 * Get all featured repos as a flat array (normalized)
 */
export function getAllFeaturedRepos(): FeaturedRepoConfig[] {
  return PROJECT_CATEGORIES.flatMap((category) =>
    featuredRepos[category].map(normalizeRepoConfig),
  );
}

/**
 * Get featured repos for a specific category (normalized)
 */
export function getReposByCategory(
  category: ProjectCategory,
): FeaturedRepoConfig[] {
  return featuredRepos[category].map(normalizeRepoConfig);
}

/**
 * Find which category a repo belongs to by its slug (repo name)
 * Returns undefined if not found
 */
export function getCategoryForRepo(slug: string): ProjectCategory | undefined {
  for (const category of PROJECT_CATEGORIES) {
    const repos = featuredRepos[category];
    const found = repos.some((config) => {
      const { repo } = normalizeRepoConfig(config);
      return repo === slug;
    });
    if (found) return category;
  }
  return undefined;
}

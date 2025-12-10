/**
 * GitHub Projects Configuration
 *
 * This file contains the curated list of repositories to display
 * on the projects page. Supports repos from any GitHub owner.
 */

/**
 * Default GitHub username for repos without explicit owner
 */
export const DEFAULT_GITHUB_OWNER = "hobbescodes";

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
 * Curated list of repositories to feature on the projects page.
 * - String: repo name owned by DEFAULT_GITHUB_OWNER
 * - Object: { owner, repo } for external repos or OSS contributions
 */
export const featuredRepos: (string | FeaturedRepoConfig)[] = [
  // Personal projects
  "foundry-fund-me",

  // OSS contributions
  { owner: "omnidotdev", repo: "backfeed-app", displayName: "Backfeed" },
  { owner: "omnidotdev", repo: "garden", displayName: "Garden" },
];

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

import { createServerFn } from "@tanstack/react-start";

import { featuredRepos, normalizeRepoConfig } from "@/lib/projects.config";

import type { Project, ProjectWithReadme } from "@/types";

/**
 * GitHub API base URL
 */
const GITHUB_API_BASE = "https://api.github.com";

/**
 * Get GitHub API headers, optionally with authentication
 */
function getGitHubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "hobbescodes-website",
  };

  // Use GITHUB_TOKEN env var if available for higher rate limits
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * GitHub API response type for a repository
 */
interface GitHubRepoResponse {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string;
}

/**
 * GitHub API response type for README content
 */
interface GitHubReadmeResponse {
  content: string;
  encoding: string;
}

/**
 * Transform GitHub API response to Project type
 */
function transformRepoToProject(repo: GitHubRepoResponse): Project {
  return {
    name: repo.name,
    description: repo.description ?? "No description provided",
    url: repo.html_url,
    language: repo.language ?? "Unknown",
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    topics: repo.topics,
    updatedAt: repo.updated_at,
  };
}

/**
 * Fetch a single repository from GitHub API
 */
async function fetchRepositoryInternal(
  owner: string,
  repo: string,
): Promise<Project> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;

  const response = await fetch(url, {
    headers: getGitHubHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch repository ${owner}/${repo}: ${response.status} ${response.statusText}`,
    );
  }

  const repoData: GitHubRepoResponse = await response.json();
  return transformRepoToProject(repoData);
}

/**
 * Fetch README content for a repository
 */
async function fetchReadmeInternal(
  owner: string,
  repo: string,
): Promise<string> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`,
    { headers: getGitHubHeaders() },
  );

  if (!response.ok) {
    // README might not exist, return placeholder
    if (response.status === 404) {
      return "# No README\n\nThis repository does not have a README file.";
    }
    throw new Error(`Failed to fetch README: ${response.statusText}`);
  }

  const readmeData: GitHubReadmeResponse = await response.json();

  // GitHub returns base64 encoded content
  if (readmeData.encoding === "base64") {
    return atob(readmeData.content);
  }

  return readmeData.content;
}

/**
 * Server function to fetch all featured projects from GitHub API
 */
export const fetchProjects = createServerFn({ method: "GET" }).handler(
  async (): Promise<Project[]> => {
    const projects = await Promise.all(
      featuredRepos.map((config) => {
        const { owner, repo } = normalizeRepoConfig(config);
        return fetchRepositoryInternal(owner, repo);
      }),
    );

    return projects;
  },
);

/**
 * Find a repo config by slug (repo name)
 */
function findRepoBySlug(slug: string) {
  for (const config of featuredRepos) {
    const normalized = normalizeRepoConfig(config);
    if (normalized.repo === slug) {
      return normalized;
    }
  }
  return null;
}

/**
 * Server function to fetch a single project by slug (repo name) with README
 */
export const fetchProjectWithReadme = createServerFn({ method: "GET" })
  .inputValidator((slug: unknown): string => {
    if (typeof slug !== "string") {
      throw new Error("Invalid slug");
    }
    return slug;
  })
  .handler(async ({ data: slug }): Promise<ProjectWithReadme> => {
    // Find the repo config by slug
    const repoConfig = findRepoBySlug(slug);
    if (!repoConfig) {
      throw new Error(`Project not found: ${slug}`);
    }

    const { owner, repo } = repoConfig;

    const [project, readme] = await Promise.all([
      fetchRepositoryInternal(owner, repo),
      fetchReadmeInternal(owner, repo),
    ]);

    return { ...project, readme };
  });

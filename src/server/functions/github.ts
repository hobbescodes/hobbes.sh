import { createServerFn } from "@tanstack/react-start";

import { getAllFeaturedRepos, getReposByCategory } from "@/lib/projects.config";

import type { ProjectCategory } from "@/lib/projects.config";
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
    // GitHub Personal Access Tokens use 'token' prefix, not 'Bearer'
    headers.Authorization = `token ${token}`;
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
function transformRepoToProject(
  repo: GitHubRepoResponse,
  owner: string,
): Project {
  return {
    owner,
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
    // Get more detailed error info
    let errorMessage = `Failed to fetch repository ${owner}/${repo}: ${response.status} ${response.statusText}`;

    try {
      const errorBody = await response.json();
      if (errorBody.message) {
        errorMessage += ` - ${errorBody.message}`;
      }

      // Add helpful hint for authentication errors
      if (response.status === 401) {
        const hasToken = !!process.env.GITHUB_TOKEN;
        if (hasToken) {
          errorMessage +=
            "\n\nYour GITHUB_TOKEN appears to be invalid. Please check:\n";
          errorMessage += "1. Token is not expired\n";
          errorMessage += "2. Token has no extra whitespace in .env file\n";
          errorMessage +=
            "3. Token starts with 'ghp_' (classic PAT) or 'github_pat_' (fine-grained PAT)\n";
          errorMessage += "4. Dev server was restarted after adding token";
        } else {
          errorMessage +=
            "\n\nNo GITHUB_TOKEN found. Set GITHUB_TOKEN in your .env file to avoid rate limits.";
        }
      }
    } catch {
      // Ignore JSON parse errors
    }

    throw new Error(errorMessage);
  }

  const repoData: GitHubRepoResponse = await response.json();
  return transformRepoToProject(repoData, owner);
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
 * Server function to fetch projects for a specific category
 */
export const fetchProjectsByCategory = createServerFn({ method: "GET" })
  .inputValidator((category: unknown): ProjectCategory => {
    if (
      category !== "owned" &&
      category !== "omnidotdev" &&
      category !== "contrib"
    ) {
      throw new Error("Invalid category");
    }
    return category;
  })
  .handler(async ({ data: category }): Promise<Project[]> => {
    const repos = getReposByCategory(category);
    const projects = await Promise.all(
      repos.map(({ owner, repo }) => fetchRepositoryInternal(owner, repo)),
    );

    return projects;
  });

/**
 * Find a repo config by slug (repo name)
 */
function findRepoBySlug(slug: string) {
  const allRepos = getAllFeaturedRepos();
  return allRepos.find((config) => config.repo === slug) ?? null;
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

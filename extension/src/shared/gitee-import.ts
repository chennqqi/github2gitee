import { GITEE_IMPORT_URL_PAGE } from "./types";

/**
 * Builds the preferred Gitee "import from URL" page link.
 * Spike: /projects/import/url requires login and is the documented flow entry for third-party public repos.
 */
export function buildGiteeImportUrl(githubCloneOrPageUrl: string): string {
  const target = new URL(GITEE_IMPORT_URL_PAGE);
  target.searchParams.set("url", githubCloneOrPageUrl);
  return target.toString();
}

/**
 * Builds a standard HTTPS clone URL for a GitHub repository.
 */
export function buildGithubCloneUrl(owner: string, repo: string): string {
  return `https://github.com/${owner}/${repo}.git`;
}

/**
 * Builds the Gitee repository home URL.
 */
export function buildGiteeRepoUrl(owner: string, repo: string): string {
  return `https://gitee.com/${owner}/${repo}`;
}

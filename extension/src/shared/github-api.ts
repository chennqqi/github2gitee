/**
 * GitHub API helpers for public repository metadata.
 */

export type GithubRepoInfo = {
  full_name: string;
  default_branch: string;
  html_url: string;
  clone_url: string;
};

/**
 * Loads basic repository information from GitHub.
 */
export async function getGithubRepo(
  owner: string,
  repo: string,
  token = "",
): Promise<GithubRepoInfo> {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
  };
  if (token.trim()) {
    headers.authorization = `Bearer ${token.trim()}`;
  }
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    { headers },
  );
  if (!response.ok) {
    throw new Error(`Get GitHub repo failed (HTTP ${response.status})`);
  }
  const data = (await response.json()) as {
    full_name: string;
    default_branch: string;
    html_url: string;
    clone_url: string;
  };
  return {
    full_name: data.full_name,
    default_branch: data.default_branch,
    html_url: data.html_url,
    clone_url: data.clone_url,
  };
}

/**
 * Returns the latest commit SHA for a branch.
 */
export async function getGithubLatestSha(
  owner: string,
  repo: string,
  branch: string,
  token = "",
): Promise<string | null> {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
  };
  if (token.trim()) {
    headers.authorization = `Bearer ${token.trim()}`;
  }
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?sha=${encodeURIComponent(branch)}&per_page=1`,
    { headers },
  );
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as Array<{ sha?: string }>;
  return data[0]?.sha ?? null;
}

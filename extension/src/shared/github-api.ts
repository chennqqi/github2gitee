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
 * Builds request headers. Token is optional for public repositories.
 */
function buildHeaders(token = ""): Record<string, string> {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
  };
  if (token.trim()) {
    headers.authorization = `Bearer ${token.trim()}`;
  }
  return headers;
}

/**
 * Returns true when the response indicates auth/rate-limit problems that may
 * succeed again without a (bad) Authorization header.
 */
function shouldRetryWithoutToken(status: number, usedToken: boolean): boolean {
  return usedToken && (status === 401 || status === 403);
}

/**
 * Formats a GitHub HTTP failure into a user-facing English message.
 */
async function formatGithubHttpError(
  response: Response,
  action: string,
): Promise<string> {
  let detail = "";
  try {
    const body = (await response.json()) as { message?: string };
    if (body.message) {
      detail = ` — ${body.message}`;
    }
  } catch {
    // Ignore non-JSON error bodies.
  }
  if (response.status === 403 || response.status === 429) {
    return `${action} failed (HTTP ${response.status})${detail}. GitHub token is optional for public repos; leave it empty, or set a valid token if you hit rate limits.`;
  }
  return `${action} failed (HTTP ${response.status})${detail}`;
}

/**
 * Fetches a GitHub URL, retrying without token when an optional token is rejected.
 */
async function githubFetch(
  url: string,
  token = "",
): Promise<Response> {
  const trimmed = token.trim();
  const response = await fetch(url, { headers: buildHeaders(trimmed) });
  if (!shouldRetryWithoutToken(response.status, Boolean(trimmed))) {
    return response;
  }
  // Invalid/expired optional GitHub tokens break public-repo reads; fall back.
  console.info(
    "[github2gitee] GitHub token rejected; retrying without Authorization",
  );
  return fetch(url, { headers: buildHeaders("") });
}

/**
 * Loads basic repository information from GitHub.
 */
export async function getGithubRepo(
  owner: string,
  repo: string,
  token = "",
): Promise<GithubRepoInfo> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const response = await githubFetch(url, token);
  if (!response.ok) {
    throw new Error(await formatGithubHttpError(response, "Get GitHub repo"));
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
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?sha=${encodeURIComponent(branch)}&per_page=1`;
  const response = await githubFetch(url, token);
  if (!response.ok) {
    console.info(
      "[github2gitee]",
      await formatGithubHttpError(response, "Get GitHub commit SHA"),
    );
    return null;
  }
  const data = (await response.json()) as Array<{ sha?: string }>;
  return data[0]?.sha ?? null;
}

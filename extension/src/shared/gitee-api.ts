/**
 * Minimal Gitee Open API helpers used by the extension.
 */

export type GiteeUser = {
  login: string;
  name?: string;
};

export type GiteeRepo = {
  full_name: string;
  html_url: string;
  default_branch?: string;
};

/**
 * Validates a Gitee token and returns the authenticated user.
 */
export async function getGiteeUser(token: string): Promise<GiteeUser> {
  if (!token.trim()) {
    throw new Error("Gitee token is empty");
  }
  const response = await fetch(
    `https://gitee.com/api/v5/user?access_token=${encodeURIComponent(token)}`,
  );
  if (!response.ok) {
    throw new Error(`Gitee token validation failed (HTTP ${response.status})`);
  }
  const data = (await response.json()) as GiteeUser;
  if (!data.login) {
    throw new Error("Gitee token validation returned no login");
  }
  return data;
}

/**
 * Fetches a Gitee repository when it exists.
 */
export async function getGiteeRepo(
  token: string,
  owner: string,
  repo: string,
): Promise<GiteeRepo | null> {
  const response = await fetch(
    `https://gitee.com/api/v5/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}?access_token=${encodeURIComponent(token)}`,
  );
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Get Gitee repo failed (HTTP ${response.status})`);
  }
  return (await response.json()) as GiteeRepo;
}

/**
 * Returns the latest commit SHA on the given ref (default branch if omitted).
 */
export async function getLatestCommitSha(
  token: string,
  owner: string,
  repo: string,
  sha = "master",
): Promise<string | null> {
  const response = await fetch(
    `https://gitee.com/api/v5/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?access_token=${encodeURIComponent(token)}&sha=${encodeURIComponent(sha)}&per_page=1`,
  );
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as Array<{ sha?: string }>;
  return data[0]?.sha ?? null;
}

/**
 * Attempts to trigger Gitee official Pull mirror update.
 * Documented webhook target shape: /repos/:owner/:repo/remote_mirror/pull
 */
export async function triggerRemoteMirrorPull(
  token: string,
  owner: string,
  repo: string,
): Promise<{ ok: boolean; status: number; body: string }> {
  const url = `https://gitee.com/api/v5/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/remote_mirror/pull?access_token=${encodeURIComponent(token)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  const body = await response.text();
  return { ok: response.ok, status: response.status, body };
}

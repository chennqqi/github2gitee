/** Shared domain types. Persisted JSON keys use snake_case. */

export type SyncStatus =
  | "pending_import"
  | "mapped"
  | "running"
  | "success"
  | "failed"
  | "update_available"
  | "needs_manual_sync";

/**
 * User-facing extension configuration stored locally.
 */
export type AppConfig = {
  gitee_token: string;
  github_token: string;
  poll_interval_minutes: number;
  /** UI language preference: zh | en | auto (follow browser). */
  locale: "zh" | "en" | "auto";
};

/**
 * Mapping between a GitHub source repository and a Gitee target repository.
 */
export type RepoMapping = {
  id: string;
  github_owner: string;
  github_repo: string;
  gitee_owner: string;
  gitee_repo: string;
  auto_sync: boolean;
  status: SyncStatus;
  last_github_sha?: string;
  last_gitee_sha?: string;
  last_sync_at?: string;
  /** ISO time of the last GitHub/Gitee SHA comparison (rate-limit gate). */
  last_sha_check_at?: string;
  last_error?: string;
  gitee_repo_url?: string;
  github_clone_url?: string;
  sync_mode?: "official_mirror_api" | "open_gitee_page" | "unknown";
  created_at: string;
  updated_at: string;
};

export const DEFAULT_CONFIG: AppConfig = {
  gitee_token: "",
  github_token: "",
  poll_interval_minutes: 20,
  locale: "auto",
};

export const POLL_ALARM_NAME = "github2gitee_poll";

/** Minimum interval between on-demand SHA comparisons per mapping (API rate limit). */
export const MIN_SHA_CHECK_INTERVAL_MS = 10 * 60 * 1000;

export const GITEE_IMPORT_URL_PAGE = "https://gitee.com/projects/import/url";

/**
 * Returns true when the mapping UI should offer an actionable Sync now button.
 */
export function mappingNeedsSync(status: SyncStatus): boolean {
  return (
    status === "update_available" ||
    status === "needs_manual_sync" ||
    status === "failed"
  );
}

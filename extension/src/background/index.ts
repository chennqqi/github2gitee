import browser from "webextension-polyfill";
import type { ExtensionMessage, ExtensionResponse } from "../shared/messages";
import {
  getGiteeRepo,
  getGiteeUser,
  getLatestCommitSha,
  triggerRemoteMirrorPull,
} from "../shared/gitee-api";
import {
  buildGiteeImportUrl,
  buildGiteeRepoUrl,
  buildGithubCloneUrl,
} from "../shared/gitee-import";
import { attemptOfficialSync } from "../shared/gitee-sync";
import { getGithubLatestSha, getGithubRepo } from "../shared/github-api";
import {
  findMappingByGithub,
  getConfig,
  listMappings,
  removeMapping,
  saveConfig,
  upsertMapping,
} from "../shared/storage";
import {
  MIN_SHA_CHECK_INTERVAL_MS,
  POLL_ALARM_NAME,
  type AppConfig,
  type RepoMapping,
} from "../shared/types";
import { resolveLocale } from "../shared/i18n";

export type ShaCheckResult = {
  mapping: RepoMapping;
  checked: boolean;
  retry_after_seconds?: number;
};

/**
 * Compares GitHub and Gitee tip SHAs and updates mapping status.
 * Throttled unless `force` is true (background poll uses force).
 */
async function refreshMappingShaStatus(
  mapping: RepoMapping,
  config: AppConfig,
  options?: { force?: boolean },
): Promise<ShaCheckResult> {
  const force = options?.force === true;
  const nowMs = Date.now();
  if (!force && mapping.last_sha_check_at) {
    const elapsed = nowMs - Date.parse(mapping.last_sha_check_at);
    if (Number.isFinite(elapsed) && elapsed < MIN_SHA_CHECK_INTERVAL_MS) {
      return {
        mapping,
        checked: false,
        retry_after_seconds: Math.ceil(
          (MIN_SHA_CHECK_INTERVAL_MS - elapsed) / 1000,
        ),
      };
    }
  }

  if (mapping.status === "pending_import" || mapping.status === "running") {
    return { mapping, checked: false };
  }

  const gh = await getGithubRepo(
    mapping.github_owner,
    mapping.github_repo,
    config.github_token,
  );
  const ghSha = await getGithubLatestSha(
    mapping.github_owner,
    mapping.github_repo,
    gh.default_branch,
    config.github_token,
  );
  const geeSha = await getLatestCommitSha(
    config.gitee_token,
    mapping.gitee_owner,
    mapping.gitee_repo,
    gh.default_branch,
  );

  mapping.last_github_sha = ghSha ?? mapping.last_github_sha;
  mapping.last_gitee_sha = geeSha ?? mapping.last_gitee_sha;
  mapping.last_sha_check_at = new Date().toISOString();
  mapping.updated_at = mapping.last_sha_check_at;

  if (ghSha && geeSha && ghSha !== geeSha) {
    mapping.status = "update_available";
    mapping.last_error =
      "GitHub is ahead. Click Sync now to update Gitee.";
  } else if (ghSha && geeSha && ghSha === geeSha) {
    mapping.status = "success";
    mapping.last_error = undefined;
  }

  await upsertMapping(mapping);
  return { mapping, checked: true };
}

/**
 * Schedules the repository polling alarm using the configured interval.
 */
async function ensurePollAlarm(config?: AppConfig): Promise<void> {
  const current = config ?? (await getConfig());
  const minutes = Math.min(60, Math.max(10, current.poll_interval_minutes || 20));
  await browser.alarms.clear(POLL_ALARM_NAME);
  await browser.alarms.create(POLL_ALARM_NAME, { periodInMinutes: minutes });
}

/**
 * Starts the Gitee official import flow for a GitHub repository.
 */
async function requestImport(message: {
  github_owner: string;
  github_repo: string;
  gitee_repo?: string;
}): Promise<RepoMapping> {
  const config = await getConfig();
  if (!config.gitee_token) {
    throw new Error("Please configure a Gitee token in Options first");
  }

  const user = await getGiteeUser(config.gitee_token);
  const existing = await findMappingByGithub(
    message.github_owner,
    message.github_repo,
  );
  const giteeRepoName = message.gitee_repo?.trim() || message.github_repo;
  const cloneUrl = buildGithubCloneUrl(message.github_owner, message.github_repo);
  const importUrl = buildGiteeImportUrl(cloneUrl);
  const now = new Date().toISOString();

  const mapping: RepoMapping = existing
    ? {
        ...existing,
        gitee_owner: user.login,
        gitee_repo: giteeRepoName,
        status: "pending_import",
        github_clone_url: cloneUrl,
        gitee_repo_url: buildGiteeRepoUrl(user.login, giteeRepoName),
        updated_at: now,
        last_error:
          "Opened Gitee import page. Finish import, then click Confirm imported.",
      }
    : {
        id: crypto.randomUUID(),
        github_owner: message.github_owner,
        github_repo: message.github_repo,
        gitee_owner: user.login,
        gitee_repo: giteeRepoName,
        auto_sync: true,
        status: "pending_import",
        github_clone_url: cloneUrl,
        gitee_repo_url: buildGiteeRepoUrl(user.login, giteeRepoName),
        created_at: now,
        updated_at: now,
        last_error:
          "Opened Gitee import page. Finish import, then click Confirm imported.",
      };

  await upsertMapping(mapping);
  await browser.tabs.create({ url: importUrl });

  try {
    await navigator.clipboard.writeText(cloneUrl);
  } catch {
    // Clipboard may be unavailable in the service worker; ignore.
  }

  return mapping;
}

/**
 * Registers a mapping for a repository already imported on Gitee.
 */
async function registerExistingMapping(message: {
  github_owner: string;
  github_repo: string;
  gitee_repo?: string;
}): Promise<RepoMapping> {
  const config = await getConfig();
  if (!config.gitee_token) {
    throw new Error("Please configure a Gitee token in Options first");
  }
  const user = await getGiteeUser(config.gitee_token);
  const giteeRepoName = message.gitee_repo?.trim() || message.github_repo;
  const repo = await getGiteeRepo(config.gitee_token, user.login, giteeRepoName);
  if (!repo) {
    throw new Error(
      `Gitee repository ${user.login}/${giteeRepoName} was not found. Import it first.`,
    );
  }

  const now = new Date().toISOString();
  const existing = await findMappingByGithub(
    message.github_owner,
    message.github_repo,
  );
  const mapping: RepoMapping = {
    id: existing?.id || crypto.randomUUID(),
    github_owner: message.github_owner,
    github_repo: message.github_repo,
    gitee_owner: user.login,
    gitee_repo: giteeRepoName,
    auto_sync: true,
    status: "mapped",
    gitee_repo_url: repo.html_url,
    github_clone_url: buildGithubCloneUrl(
      message.github_owner,
      message.github_repo,
    ),
    created_at: existing?.created_at || now,
    updated_at: now,
    last_error: undefined,
  };
  await upsertMapping(mapping);
  return mapping;
}

/**
 * Confirms that a pending import finished by checking the Gitee repository.
 */
async function confirmImported(id: string): Promise<RepoMapping> {
  const config = await getConfig();
  const mappings = await listMappings();
  const mapping = mappings.find((item) => item.id === id);
  if (!mapping) {
    throw new Error("Mapping not found");
  }
  if (!config.gitee_token) {
    throw new Error("Please configure a Gitee token in Options first");
  }

  const repo = await getGiteeRepo(
    config.gitee_token,
    mapping.gitee_owner,
    mapping.gitee_repo,
  );
  if (!repo) {
    throw new Error(
      "Gitee repository not found yet. Finish the official import, then retry.",
    );
  }

  mapping.status = "success";
  mapping.gitee_repo_url = repo.html_url;
  mapping.last_sync_at = new Date().toISOString();
  mapping.updated_at = mapping.last_sync_at;
  mapping.last_error =
    "Import confirmed. Tip: treat Gitee as a backup; force sync may overwrite.";
  await upsertMapping(mapping);
  return mapping;
}

/**
 * Runs manual sync via mirror API or opens the Gitee repo page.
 */
async function manualSync(id: string): Promise<RepoMapping> {
  const config = await getConfig();
  const mappings = await listMappings();
  const mapping = mappings.find((item) => item.id === id);
  if (!mapping) {
    throw new Error("Mapping not found");
  }
  if (!config.gitee_token) {
    throw new Error("Please configure a Gitee token in Options first");
  }

  mapping.status = "running";
  mapping.updated_at = new Date().toISOString();
  await upsertMapping(mapping);

  const result = await attemptOfficialSync(config.gitee_token, mapping);
  mapping.sync_mode = result.mode;
  mapping.last_error = result.message;
  mapping.status =
    result.mode === "official_mirror_api" ? "success" : "needs_manual_sync";
  mapping.last_sync_at = new Date().toISOString();
  mapping.updated_at = mapping.last_sync_at;
  await upsertMapping(mapping);

  if (result.mode === "official_mirror_api") {
    try {
      const refreshed = await refreshMappingShaStatus(mapping, config, {
        force: true,
      });
      return refreshed.mapping;
    } catch {
      return mapping;
    }
  }
  return mapping;
}

/**
 * Compares GitHub and Gitee SHAs for auto-sync mappings.
 * Also auto-confirms pending imports when the Gitee repo appears.
 */
async function runPollPass(): Promise<void> {
  const config = await getConfig();
  if (!config.gitee_token) {
    return;
  }
  const mappings = await listMappings();
  for (const mapping of mappings) {
    try {
      if (mapping.status === "pending_import") {
        const repo = await getGiteeRepo(
          config.gitee_token,
          mapping.gitee_owner,
          mapping.gitee_repo,
        );
        if (repo) {
          mapping.status = "success";
          mapping.gitee_repo_url = repo.html_url;
          mapping.last_sync_at = new Date().toISOString();
          mapping.updated_at = mapping.last_sync_at;
          mapping.last_error =
            "Import auto-confirmed. Tip: treat Gitee as a backup; force sync may overwrite.";
          await upsertMapping(mapping);
        }
        continue;
      }

      if (!mapping.auto_sync) {
        continue;
      }

      // Alarm-driven poll always compares SHAs (already spaced 10–60 minutes).
      const result = await refreshMappingShaStatus(mapping, config, {
        force: true,
      });
      const current = result.mapping;
      if (
        current.status === "update_available" &&
        current.last_github_sha &&
        current.last_gitee_sha &&
        current.last_github_sha !== current.last_gitee_sha
      ) {
        const api = await triggerRemoteMirrorPull(
          config.gitee_token,
          current.gitee_owner,
          current.gitee_repo,
        );
        if (api.ok) {
          current.status = "success";
          current.sync_mode = "official_mirror_api";
          current.last_error = "Auto-triggered Gitee remote_mirror pull";
          current.last_sync_at = new Date().toISOString();
          current.updated_at = current.last_sync_at;
          await upsertMapping(current);
        } else {
          current.sync_mode = "open_gitee_page";
          current.last_error =
            "GitHub is ahead. Click Sync now to open Gitee 同步更新.";
          await upsertMapping(current);
        }
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      console.info("[github2gitee] poll mapping failed:", text);
    }
  }
}

/**
 * Handles runtime messages from popup, options, and content scripts.
 */
async function handleMessage(
  message: ExtensionMessage,
): Promise<ExtensionResponse> {
  try {
    switch (message.type) {
      case "get_config":
        return { ok: true, data: await getConfig() };
      case "save_config":
        await saveConfig(message.config);
        await ensurePollAlarm(message.config);
        return { ok: true };
      case "list_mappings":
        return { ok: true, data: await listMappings() };
      case "remove_mapping":
        await removeMapping(message.id);
        return { ok: true };
      case "toggle_auto_sync": {
        const mappings = await listMappings();
        const target = mappings.find((item) => item.id === message.id);
        if (!target) {
          return { ok: false, error: "Mapping not found" };
        }
        target.auto_sync = message.auto_sync;
        target.updated_at = new Date().toISOString();
        await upsertMapping(target);
        return { ok: true, data: target };
      }
      case "request_import":
        return { ok: true, data: await requestImport(message) };
      case "register_existing_mapping":
        return { ok: true, data: await registerExistingMapping(message) };
      case "confirm_imported":
        return { ok: true, data: await confirmImported(message.id) };
      case "manual_sync":
        return { ok: true, data: await manualSync(message.id) };
      case "validate_gitee_token": {
        const config = await getConfig();
        const user = await getGiteeUser(config.gitee_token);
        return { ok: true, data: user };
      }
      case "run_poll_now":
        await runPollPass();
        return { ok: true, data: await listMappings() };
      case "check_mapping_sync": {
        const config = await getConfig();
        if (!config.gitee_token) {
          throw new Error("Please configure a Gitee token in Options first");
        }
        const mappings = await listMappings();
        const mapping = mappings.find((item) => item.id === message.id);
        if (!mapping) {
          throw new Error("Mapping not found");
        }
        return {
          ok: true,
          data: await refreshMappingShaStatus(mapping, config, {
            force: message.force === true,
          }),
        };
      }
      case "get_page_context": {
        const config = await getConfig();
        let mapping = await findMappingByGithub(
          message.github_owner,
          message.github_repo,
        );
        const locale = resolveLocale(config.locale);
        if (!config.gitee_token.trim()) {
          return {
            ok: true,
            data: {
              has_gitee_token: false,
              mapping,
              locale,
              locale_pref: config.locale,
            },
          };
        }
        try {
          const user = await getGiteeUser(config.gitee_token);
          if (
            mapping &&
            mapping.status !== "pending_import" &&
            mapping.status !== "running"
          ) {
            // Throttled SHA check so Sync now only appears when GitHub is ahead.
            // Failures here must not look like a Gitee token error.
            try {
              const checked = await refreshMappingShaStatus(mapping, config, {
                force: false,
              });
              mapping = checked.mapping;
            } catch (shaError) {
              const text =
                shaError instanceof Error ? shaError.message : String(shaError);
              console.info("[github2gitee] SHA status check skipped:", text);
            }
          }
          return {
            ok: true,
            data: {
              has_gitee_token: true,
              gitee_login: user.login,
              mapping,
              locale,
              locale_pref: config.locale,
            },
          };
        } catch (error) {
          const text = error instanceof Error ? error.message : String(error);
          return {
            ok: true,
            data: {
              has_gitee_token: false,
              token_error: text,
              mapping,
              locale,
              locale_pref: config.locale,
            },
          };
        }
      }
      case "open_options":
        await browser.runtime.openOptionsPage();
        return { ok: true };
      case "page_repo_detected":
        return { ok: true };
      default:
        return { ok: false, error: "Unknown message type" };
    }
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    return { ok: false, error: text };
  }
}

browser.runtime.onMessage.addListener((message: unknown) =>
  handleMessage(message as ExtensionMessage),
);

browser.runtime.onInstalled.addListener(() => {
  void ensurePollAlarm();
});

browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== POLL_ALARM_NAME) {
    return;
  }
  void runPollPass();
});

void ensurePollAlarm();

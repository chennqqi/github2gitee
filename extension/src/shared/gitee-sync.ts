import browser from "webextension-polyfill";
import { triggerRemoteMirrorPull } from "./gitee-api";
import { buildGiteeRepoUrl } from "./gitee-import";
import type { RepoMapping } from "./types";

export type SyncAttemptResult = {
  mode: "official_mirror_api" | "open_gitee_page";
  message: string;
  opened_url?: string;
};

/**
 * Tries official mirror pull API first; falls back to opening the Gitee repo page
 * so the user can click "同步更新" (force sync).
 */
export async function attemptOfficialSync(
  token: string,
  mapping: RepoMapping,
): Promise<SyncAttemptResult> {
  const apiResult = await triggerRemoteMirrorPull(
    token,
    mapping.gitee_owner,
    mapping.gitee_repo,
  );
  if (apiResult.ok) {
    return {
      mode: "official_mirror_api",
      message: "Triggered Gitee remote_mirror pull",
    };
  }

  const openedUrl = buildGiteeRepoUrl(mapping.gitee_owner, mapping.gitee_repo);
  await browser.tabs.create({ url: openedUrl });
  return {
    mode: "open_gitee_page",
    opened_url: openedUrl,
    message:
      `Mirror API unavailable (HTTP ${apiResult.status}). Opened Gitee repo page — click 同步更新 to force sync.`,
  };
}

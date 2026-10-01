/** Message protocol between extension pages and the background worker. */

import type { AppConfig } from "./types";

export type ExtensionMessage =
  | { type: "get_config" }
  | { type: "save_config"; config: AppConfig }
  | { type: "list_mappings" }
  | { type: "remove_mapping"; id: string }
  | { type: "toggle_auto_sync"; id: string; auto_sync: boolean }
  | { type: "manual_sync"; id: string }
  | { type: "confirm_imported"; id: string }
  | { type: "register_existing_mapping"; github_owner: string; github_repo: string; gitee_repo?: string }
  | {
      type: "request_import";
      github_owner: string;
      github_repo: string;
      gitee_repo?: string;
    }
  | { type: "validate_gitee_token" }
  | { type: "run_poll_now" }
  | { type: "get_page_context"; github_owner: string; github_repo: string }
  | { type: "open_options" }
  | { type: "page_repo_detected"; github_owner: string; github_repo: string };

export type PageContext = {
  has_gitee_token: boolean;
  gitee_login?: string;
  token_error?: string;
  mapping?: import("./types").RepoMapping;
  locale: "zh" | "en";
  locale_pref: "zh" | "en" | "auto";
};

export type ExtensionResponse =
  | { ok: true; data?: unknown }
  | { ok: false; error: string };

import browser from "webextension-polyfill";
import { resolveLocale, t, type Locale } from "../shared/i18n";
import type { ExtensionResponse } from "../shared/messages";
import type { AppConfig, RepoMapping } from "../shared/types";

/**
 * Sends a typed runtime message and unwraps the response payload.
 */
async function sendMessage<T>(message: Record<string, unknown>): Promise<T> {
  const response = (await browser.runtime.sendMessage(
    message,
  )) as ExtensionResponse;
  if (!response?.ok) {
    throw new Error(response?.error || "Request failed");
  }
  return response.data as T;
}

let locale: Locale = "en";

/**
 * Maps internal status codes to localized labels.
 */
function statusLabel(status: RepoMapping["status"]): string {
  switch (status) {
    case "pending_import":
      return t(locale, "status_pending");
    case "mapped":
      return t(locale, "status_mapped");
    case "running":
      return t(locale, "status_running");
    case "success":
      return t(locale, "status_success");
    case "failed":
      return t(locale, "status_failed");
    case "update_available":
      return t(locale, "status_update");
    case "needs_manual_sync":
      return t(locale, "status_manual");
    default:
      return status;
  }
}

/**
 * Applies feature-page chrome strings for the current locale.
 */
function applyChrome(): void {
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  (document.getElementById("title") as HTMLElement).textContent = t(
    locale,
    "popup_title",
  );
  (document.getElementById("hint") as HTMLElement).textContent = t(
    locale,
    "popup_hint",
  );
  (document.getElementById("mappings_heading") as HTMLElement).textContent = t(
    locale,
    "mappings_title",
  );
  (document.getElementById("poll_now") as HTMLElement).textContent = t(
    locale,
    "check_now",
  );
  (document.getElementById("settings_link") as HTMLElement).textContent = t(
    locale,
    "settings",
  );
  (document.getElementById("register_title") as HTMLElement).textContent = t(
    locale,
    "register_title",
  );
  (document.getElementById("reg_github") as HTMLInputElement).placeholder = t(
    locale,
    "register_github_ph",
  );
  (document.getElementById("reg_gitee_repo") as HTMLInputElement).placeholder =
    t(locale, "register_gitee_ph");
  (document.getElementById("reg_btn") as HTMLElement).textContent = t(
    locale,
    "register_btn",
  );
}

/**
 * Renders the repository mapping list in the feature popup.
 */
function renderMappings(mappings: RepoMapping[]): void {
  const root = document.getElementById("list-root");
  if (!root) {
    return;
  }
  if (mappings.length === 0) {
    root.className = "empty";
    root.textContent = t(locale, "mappings_empty");
    return;
  }

  root.className = "";
  root.innerHTML = "";
  const list = document.createElement("ul");

  for (const mapping of mappings) {
    const item = document.createElement("li");
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = `${mapping.github_owner}/${mapping.github_repo}`;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `→ ${mapping.gitee_owner}/${mapping.gitee_repo} · ${statusLabel(mapping.status)}`;
    item.appendChild(title);
    item.appendChild(meta);

    if (mapping.status === "pending_import") {
      const confirmBtn = document.createElement("button");
      confirmBtn.className = "action primary";
      confirmBtn.textContent = t(locale, "confirm_imported");
      confirmBtn.addEventListener("click", () => {
        void (async () => {
          try {
            await sendMessage({ type: "confirm_imported", id: mapping.id });
            await refresh();
          } catch (error) {
            window.alert(error instanceof Error ? error.message : String(error));
          }
        })();
      });
      item.appendChild(confirmBtn);
    }

    const syncBtn = document.createElement("button");
    syncBtn.className = "action primary";
    syncBtn.textContent = t(locale, "sync_now");
    syncBtn.addEventListener("click", () => {
      void (async () => {
        try {
          await sendMessage({ type: "manual_sync", id: mapping.id });
          await refresh();
        } catch (error) {
          window.alert(error instanceof Error ? error.message : String(error));
        }
      })();
    });
    item.appendChild(syncBtn);

    if (mapping.gitee_repo_url) {
      const openBtn = document.createElement("button");
      openBtn.className = "action";
      openBtn.textContent = t(locale, "open_gitee");
      openBtn.addEventListener("click", () => {
        void browser.tabs.create({ url: mapping.gitee_repo_url });
      });
      item.appendChild(openBtn);
    }

    const removeBtn = document.createElement("button");
    removeBtn.className = "action";
    removeBtn.textContent = t(locale, "remove_mapping");
    removeBtn.addEventListener("click", () => {
      void (async () => {
        await sendMessage({ type: "remove_mapping", id: mapping.id });
        await refresh();
      })();
    });
    item.appendChild(removeBtn);

    list.appendChild(item);
  }
  root.appendChild(list);
}

/**
 * Refreshes account status and mapping list.
 */
async function refresh(): Promise<void> {
  const config = await sendMessage<AppConfig>({ type: "get_config" });
  locale = resolveLocale(config.locale);
  applyChrome();

  const statusEl = document.getElementById("token-status");
  try {
    const user = await sendMessage<{ login: string }>({
      type: "validate_gitee_token",
    });
    if (statusEl) {
      statusEl.textContent = `${t(locale, "gitee_account")}: ${user.login}`;
    }
  } catch (error) {
    if (statusEl) {
      const text = error instanceof Error ? error.message : String(error);
      statusEl.textContent = `${t(locale, "token_error")}: ${text}`;
    }
  }

  const mappings = await sendMessage<RepoMapping[]>({ type: "list_mappings" });
  renderMappings(mappings);
}

document.getElementById("reg_btn")?.addEventListener("click", () => {
  void (async () => {
    const raw = (
      document.getElementById("reg_github") as HTMLInputElement
    ).value.trim();
    const giteeRepo = (
      document.getElementById("reg_gitee_repo") as HTMLInputElement
    ).value.trim();
    const [owner, repo] = raw.split("/");
    if (!owner || !repo) {
      window.alert(t(locale, "github_format_error"));
      return;
    }
    try {
      await sendMessage({
        type: "register_existing_mapping",
        github_owner: owner,
        github_repo: repo,
        gitee_repo: giteeRepo || undefined,
      });
      await refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : String(error));
    }
  })();
});

document.getElementById("poll_now")?.addEventListener("click", () => {
  void (async () => {
    try {
      await sendMessage({ type: "run_poll_now" });
      await refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : String(error));
    }
  })();
});

void refresh();

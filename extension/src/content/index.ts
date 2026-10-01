import browser from "webextension-polyfill";
import { t, type Locale } from "../shared/i18n";
import type { ExtensionResponse, PageContext } from "../shared/messages";
import type { RepoMapping } from "../shared/types";

const ROOT_ID = "github2gitee-panel-root";
const STYLE_ID = "github2gitee-panel-style";
const LOGO_URL = browser.runtime.getURL("icons/icon48.png");
const COLLAPSE_KEY = "g2g_panel_collapsed";

/**
 * Reads whether the floating panel should stay collapsed for this tab.
 */
function readCollapsedPref(): boolean {
  try {
    const raw = sessionStorage.getItem(COLLAPSE_KEY);
    if (raw === null) {
      return true;
    }
    return raw === "1";
  } catch {
    return true;
  }
}

/**
 * Persists collapsed preference for the current tab session.
 */
function writeCollapsedPref(collapsed: boolean): void {
  try {
    sessionStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  } catch {
    // Ignore storage failures in restricted pages.
  }
}

/**
 * Parses owner/repo from a GitHub repository URL pathname.
 */
export function parseGithubRepo(
  pathname: string,
): { owner: string; repo: string } | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) {
    return null;
  }
  const owner = parts[0];
  const repo = parts[1];
  if (!owner || !repo) {
    return null;
  }
  const blocked = new Set([
    "settings",
    "orgs",
    "marketplace",
    "topics",
    "explore",
    "notifications",
    "login",
  ]);
  if (blocked.has(owner)) {
    return null;
  }
  return { owner, repo };
}

/**
 * Sends a typed message to the background service worker.
 */
async function sendMessage<T>(
  message: Record<string, unknown>,
): Promise<T> {
  const response = (await browser.runtime.sendMessage(
    message,
  )) as ExtensionResponse;
  if (!response?.ok) {
    throw new Error(response?.error || "Background request failed");
  }
  return response.data as T;
}

/**
 * Injects panel stylesheet once.
 */
function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${ROOT_ID} {
      all: initial;
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 2147483646;
      width: 292px;
      font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      color: #0f172a;
    }
    #${ROOT_ID} * { box-sizing: border-box; }
    #${ROOT_ID} .g2g-card {
      border-radius: 14px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.94);
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 28px rgba(15, 23, 42, 0.10);
      backdrop-filter: blur(10px);
      animation: g2g-in .2s ease-out;
    }
    @keyframes g2g-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: none; }
    }
    #${ROOT_ID} .g2g-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 10px 10px 4px;
    }
    #${ROOT_ID} .g2g-brand-row {
      display: flex;
      gap: 8px;
      align-items: center;
      min-width: 0;
    }
    #${ROOT_ID} .g2g-logo {
      width: 26px;
      height: 26px;
      border-radius: 7px;
      flex: 0 0 auto;
    }
    #${ROOT_ID} .g2g-brand strong {
      display: block;
      font-size: 12px;
      font-weight: 650;
      letter-spacing: 0.01em;
      color: #0f766e;
    }
    #${ROOT_ID} .g2g-brand span {
      display: block;
      margin-top: 1px;
      font-size: 10px;
      color: #64748b;
    }
    #${ROOT_ID} .g2g-tools {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    #${ROOT_ID} .g2g-close {
      border: 0;
      background: transparent;
      color: #64748b;
      font-size: 14px;
      line-height: 1;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
    }
    #${ROOT_ID} .g2g-close:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    #${ROOT_ID} .g2g-body { padding: 0 10px 10px; }
    #${ROOT_ID} .g2g-repo {
      margin: 0 0 8px;
      font-size: 11px;
      color: #475569;
      word-break: break-all;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }
    #${ROOT_ID} .g2g-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      padding: 4px 8px;
      border-radius: 999px;
      background: #f0fdfa;
      color: #0f766e;
      font-size: 11px;
    }
    #${ROOT_ID} .g2g-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #0d9488;
    }
    #${ROOT_ID} .g2g-dot.warn { background: #d97706; }
    #${ROOT_ID} .g2g-dot.bad { background: #dc2626; }
    #${ROOT_ID} .g2g-steps {
      margin: 0 0 8px;
      padding: 8px 10px;
      border-radius: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      font-size: 11px;
      color: #475569;
      line-height: 1.5;
    }
    #${ROOT_ID} .g2g-steps ol { margin: 6px 0 0; padding-left: 16px; }
    #${ROOT_ID} .g2g-msg {
      min-height: 1em; margin: 0 0 8px; font-size: 11px; color: #64748b; line-height: 1.4;
    }
    #${ROOT_ID} .g2g-msg.error { color: #dc2626; }
    #${ROOT_ID} .g2g-actions { display: flex; flex-wrap: wrap; gap: 6px; }
    #${ROOT_ID} button.g2g-btn {
      border: 0; border-radius: 8px; padding: 7px 10px;
      font-size: 11px; font-weight: 600; cursor: pointer;
      transition: background .12s ease, opacity .12s ease;
    }
    #${ROOT_ID} button.g2g-btn:disabled { opacity: .5; cursor: not-allowed; }
    #${ROOT_ID} button.g2g-primary { background: #0d9488; color: #fff; }
    #${ROOT_ID} button.g2g-primary:hover { background: #0f766e; }
    #${ROOT_ID} button.g2g-secondary {
      background: #f8fafc; color: #334155;
      border: 1px solid #e2e8f0;
    }
    #${ROOT_ID} button.g2g-secondary:hover { background: #f1f5f9; }
    #${ROOT_ID}-mini {
      all: initial;
      position: fixed; right: 16px; bottom: 16px; z-index: 2147483646;
      width: 42px; height: 42px; padding: 0; border-radius: 12px;
      border: 1px solid rgba(226, 232, 240, 0.95);
      background: rgba(255, 255, 255, 0.88);
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.10);
      cursor: pointer; display: grid; place-items: center;
      backdrop-filter: blur(8px);
      opacity: 0.58;
      transition: opacity .15s ease, transform .15s ease, box-shadow .15s ease;
      animation: g2g-in .2s ease-out;
    }
    #${ROOT_ID}-mini:hover {
      opacity: 1;
      transform: translateY(-1px);
      box-shadow: 0 8px 22px rgba(15, 23, 42, 0.14);
    }
    #${ROOT_ID}-mini img { width: 22px; height: 22px; border-radius: 6px; display: block; }
  `;
  document.documentElement.appendChild(style);
}

/**
 * Maps mapping status into localized label/tone.
 */
function statusMeta(
  locale: Locale,
  mapping?: RepoMapping,
): { label: string; tone: "ok" | "warn" | "bad" } {
  if (!mapping) {
    return { label: t(locale, "status_not_imported"), tone: "warn" };
  }
  switch (mapping.status) {
    case "pending_import":
      return { label: t(locale, "status_pending"), tone: "warn" };
    case "update_available":
      return { label: t(locale, "status_update"), tone: "warn" };
    case "needs_manual_sync":
      return { label: t(locale, "status_manual"), tone: "warn" };
    case "failed":
      return { label: t(locale, "status_failed"), tone: "bad" };
    case "running":
      return { label: t(locale, "status_running"), tone: "ok" };
    case "success":
      return { label: t(locale, "status_success"), tone: "ok" };
    case "mapped":
      return { label: t(locale, "status_mapped"), tone: "ok" };
    default:
      return { label: mapping.status, tone: "ok" };
  }
}

type PanelState = {
  owner: string;
  repo: string;
  context: PageContext;
  message: string;
  isError: boolean;
  busy: boolean;
  collapsed: boolean;
};

/**
 * Sets a single hint box under the panel using textContent only (no innerHTML).
 */
function setStepsHint(parent: HTMLElement, text: string): void {
  parent.replaceChildren();
  const box = document.createElement("div");
  box.className = "g2g-steps";
  box.textContent = text;
  parent.appendChild(box);
}

/**
 * Creates a DOM element with optional className and textContent.
 */
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

/**
 * Renders the GitHub-page control panel.
 */
function renderPanel(state: PanelState, onRefresh: () => void): void {
  ensureStyles();
  document.getElementById(ROOT_ID)?.remove();
  document.getElementById(`${ROOT_ID}-mini`)?.remove();

  const locale = state.context.locale || "en";

  if (state.collapsed) {
    const mini = document.createElement("button");
    mini.id = `${ROOT_ID}-mini`;
    mini.type = "button";
    mini.title = t(locale, "app_name");
    mini.setAttribute("aria-label", t(locale, "app_name"));
    const miniImg = document.createElement("img");
    miniImg.alt = "";
    miniImg.src = LOGO_URL;
    mini.appendChild(miniImg);
    mini.addEventListener("click", () => {
      state.collapsed = false;
      writeCollapsedPref(false);
      renderPanel(state, onRefresh);
    });
    document.documentElement.appendChild(mini);
    return;
  }

  const root = document.createElement("div");
  root.id = ROOT_ID;
  const st = statusMeta(locale, state.context.mapping);
  const needsSetup = !state.context.has_gitee_token;
  const subtitle = needsSetup
    ? t(locale, "needs_setup")
    : state.context.gitee_login
      ? `${t(locale, "gitee_user")}: ${state.context.gitee_login}`
      : t(locale, "on_page_hint");

  const card = el("div", "g2g-card");
  const head = el("div", "g2g-head");
  const brandRow = el("div", "g2g-brand-row");
  const logo = document.createElement("img");
  logo.className = "g2g-logo";
  logo.alt = "";
  logo.src = LOGO_URL;
  const brand = el("div", "g2g-brand");
  brand.appendChild(el("strong", undefined, t(locale, "app_name")));
  brand.appendChild(el("span", undefined, subtitle));
  brandRow.appendChild(logo);
  brandRow.appendChild(brand);

  const tools = el("div", "g2g-tools");
  const closeBtn = document.createElement("button");
  closeBtn.className = "g2g-close";
  closeBtn.type = "button";
  closeBtn.title = t(locale, "collapse");
  closeBtn.textContent = "×";
  tools.appendChild(closeBtn);
  head.appendChild(brandRow);
  head.appendChild(tools);

  const body = el("div", "g2g-body");
  body.appendChild(
    el("p", "g2g-repo", `${state.owner}/${state.repo}`),
  );
  const status = el("div", "g2g-status");
  const dot = el(
    "span",
    `g2g-dot${st.tone === "warn" ? " warn" : st.tone === "bad" ? " bad" : ""}`,
  );
  status.appendChild(dot);
  status.appendChild(document.createTextNode(st.label));
  body.appendChild(status);

  const setupEl = el("div", "g2g-setup");
  const msgEl = el("p", `g2g-msg${state.isError ? " error" : ""}`);
  msgEl.textContent = state.message;
  const actionsEl = el("div", "g2g-actions");
  body.appendChild(setupEl);
  body.appendChild(msgEl);
  body.appendChild(actionsEl);

  card.appendChild(head);
  card.appendChild(body);
  root.appendChild(card);

  closeBtn.addEventListener("click", () => {
    state.collapsed = true;
    writeCollapsedPref(true);
    renderPanel(state, onRefresh);
  });

  const addBtn = (
    label: string,
    kind: "primary" | "secondary",
    onClick: () => void,
  ) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `g2g-btn g2g-${kind}`;
    btn.textContent = label;
    btn.disabled = state.busy;
    btn.addEventListener("click", onClick);
    actionsEl.appendChild(btn);
  };

  if (needsSetup) {
    setStepsHint(setupEl, t(locale, "panel_setup_hint"));
    addBtn(t(locale, "open_setup"), "primary", () => {
      void sendMessage({ type: "open_options" });
    });
    addBtn(t(locale, "setup_done_refresh"), "secondary", () => onRefresh());
  } else {
    const mapping = state.context.mapping;
    if (!mapping) {
      setStepsHint(setupEl, t(locale, "import_hint"));
      addBtn(t(locale, "import_to_gitee"), "primary", () => {
        void (async () => {
          state.busy = true;
          state.message = t(locale, "opening_import");
          state.isError = false;
          renderPanel(state, onRefresh);
          try {
            const cloneUrl = `https://github.com/${state.owner}/${state.repo}.git`;
            try {
              await navigator.clipboard.writeText(cloneUrl);
            } catch {
              // ignore
            }
            await sendMessage<RepoMapping>({
              type: "request_import",
              github_owner: state.owner,
              github_repo: state.repo,
            });
            state.message = t(locale, "import_opened");
            onRefresh();
          } catch (error) {
            state.isError = true;
            state.message = error instanceof Error ? error.message : String(error);
            state.busy = false;
            renderPanel(state, onRefresh);
          }
        })();
      });
      addBtn(t(locale, "register_existing"), "secondary", () => {
        void (async () => {
          state.busy = true;
          renderPanel(state, onRefresh);
          try {
            await sendMessage({
              type: "register_existing_mapping",
              github_owner: state.owner,
              github_repo: state.repo,
            });
            state.message = t(locale, "registered");
            state.isError = false;
            onRefresh();
          } catch (error) {
            state.isError = true;
            state.message = error instanceof Error ? error.message : String(error);
            state.busy = false;
            renderPanel(state, onRefresh);
          }
        })();
      });
    } else if (mapping.status === "pending_import") {
      setStepsHint(setupEl, t(locale, "pending_hint"));
      addBtn(t(locale, "confirm_imported"), "primary", () => {
        void (async () => {
          state.busy = true;
          renderPanel(state, onRefresh);
          try {
            await sendMessage({ type: "confirm_imported", id: mapping.id });
            state.message = t(locale, "import_confirmed");
            state.isError = false;
            onRefresh();
          } catch (error) {
            state.isError = true;
            state.message = error instanceof Error ? error.message : String(error);
            state.busy = false;
            renderPanel(state, onRefresh);
          }
        })();
      });
      addBtn(t(locale, "check_now"), "secondary", () => {
        void (async () => {
          state.busy = true;
          renderPanel(state, onRefresh);
          try {
            await sendMessage({ type: "run_poll_now" });
            state.message = t(locale, "checked");
            state.isError = false;
            onRefresh();
          } catch (error) {
            state.isError = true;
            state.message = error instanceof Error ? error.message : String(error);
            state.busy = false;
            renderPanel(state, onRefresh);
          }
        })();
      });
      addBtn(t(locale, "reopen_import"), "secondary", () => {
        void (async () => {
          await sendMessage({
            type: "request_import",
            github_owner: state.owner,
            github_repo: state.repo,
          });
          onRefresh();
        })();
      });
    } else {
      setStepsHint(setupEl, t(locale, "sync_hint"));
      addBtn(t(locale, "sync_now"), "primary", () => {
        void (async () => {
          state.busy = true;
          state.message = t(locale, "syncing");
          renderPanel(state, onRefresh);
          try {
            const updated = await sendMessage<RepoMapping>({
              type: "manual_sync",
              id: mapping.id,
            });
            state.message = updated.last_error || t(locale, "checked");
            state.isError = false;
            onRefresh();
          } catch (error) {
            state.isError = true;
            state.message = error instanceof Error ? error.message : String(error);
            state.busy = false;
            renderPanel(state, onRefresh);
          }
        })();
      });
      if (mapping.gitee_repo_url) {
        addBtn(t(locale, "open_gitee"), "secondary", () => {
          window.open(mapping.gitee_repo_url, "_blank", "noopener,noreferrer");
        });
      }
      addBtn(t(locale, "refresh"), "secondary", () => onRefresh());
    }
  }

  document.documentElement.appendChild(root);
}

/**
 * Loads page context and paints the panel for the current GitHub repository.
 */
async function mountForRepo(owner: string, repo: string): Promise<void> {
  const state: PanelState = {
    owner,
    repo,
    context: {
      has_gitee_token: false,
      locale: "en",
      locale_pref: "auto",
    },
    message: "",
    isError: false,
    busy: false,
    collapsed: readCollapsedPref(),
  };

  const refresh = () => {
    void (async () => {
      try {
        state.context = await sendMessage<PageContext>({
          type: "get_page_context",
          github_owner: owner,
          github_repo: repo,
        });
        state.busy = false;
        if (state.context.token_error) {
          state.message = `${t(state.context.locale, "token_invalid")}: ${state.context.token_error}`;
          state.isError = true;
        }
        renderPanel(state, refresh);
      } catch (error) {
        state.isError = true;
        state.message = error instanceof Error ? error.message : String(error);
        state.busy = false;
        renderPanel(state, refresh);
      }
    })();
  };

  refresh();
}

function init(): void {
  const parsed = parseGithubRepo(window.location.pathname);
  if (!parsed) {
    return;
  }
  void browser.runtime.sendMessage({
    type: "page_repo_detected",
    github_owner: parsed.owner,
    github_repo: parsed.repo,
  });
  void mountForRepo(parsed.owner, parsed.repo);

  let lastPath = window.location.pathname;
  window.setInterval(() => {
    if (window.location.pathname === lastPath) {
      return;
    }
    lastPath = window.location.pathname;
    const next = parseGithubRepo(lastPath);
    document.getElementById(ROOT_ID)?.remove();
    document.getElementById(`${ROOT_ID}-mini`)?.remove();
    if (next) {
      void mountForRepo(next.owner, next.repo);
    }
  }, 1200);
}

init();

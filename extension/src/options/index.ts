import browser from "webextension-polyfill";
import { resolveLocale, t, type Locale } from "../shared/i18n";
import type { ExtensionResponse } from "../shared/messages";
import { DEFAULT_CONFIG, type AppConfig } from "../shared/types";

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

let uiLocale: Locale = "en";
let localePref: AppConfig["locale"] = "auto";

/**
 * Reads form values into an AppConfig object, preserving locale preference.
 */
function readForm(): AppConfig {
  const giteeToken = (
    document.getElementById("gitee_token") as HTMLInputElement
  ).value.trim();
  const githubToken = (
    document.getElementById("github_token") as HTMLInputElement
  ).value.trim();
  const pollRaw = (
    document.getElementById("poll_interval_minutes") as HTMLInputElement
  ).value;
  const poll = Number(pollRaw) || DEFAULT_CONFIG.poll_interval_minutes;

  return {
    gitee_token: giteeToken,
    github_token: githubToken,
    poll_interval_minutes: Math.min(60, Math.max(10, poll)),
    locale: localePref,
  };
}

/**
 * Fills the options form from stored configuration.
 */
function fillForm(config: AppConfig): void {
  (document.getElementById("gitee_token") as HTMLInputElement).value =
    config.gitee_token;
  (document.getElementById("github_token") as HTMLInputElement).value =
    config.github_token;
  (document.getElementById("poll_interval_minutes") as HTMLInputElement).value =
    String(config.poll_interval_minutes);
}

/**
 * Shows a short status message on the settings page.
 */
function setMessage(text: string, isError = false): void {
  const el = document.getElementById("message");
  if (!el) {
    return;
  }
  el.style.color = isError ? "#b91c1c" : "#0f766e";
  el.textContent = text;
}

/**
 * Applies localized chrome strings for the settings page.
 */
function applyChrome(): void {
  document.documentElement.lang = uiLocale === "zh" ? "zh-CN" : "en";
  document.title = t(uiLocale, "options_title");
  (document.getElementById("title") as HTMLElement).textContent = t(
    uiLocale,
    "options_title",
  );
  (document.getElementById("lead") as HTMLElement).textContent = t(
    uiLocale,
    "options_lead",
  );
  (document.getElementById("section_language_title") as HTMLElement).textContent =
    t(uiLocale, "section_language");
  (document.getElementById("section_tokens_title") as HTMLElement).textContent =
    t(uiLocale, "section_tokens");
  (document.getElementById("section_poll_title") as HTMLElement).textContent = t(
    uiLocale,
    "section_poll",
  );
  (document.getElementById("guide_title") as HTMLElement).textContent = t(
    uiLocale,
    "options_guide_title",
  );

  const g1 = document.getElementById("guide_1");
  if (g1) {
    g1.replaceChildren();
    g1.append(
      document.createTextNode(uiLocale === "zh" ? "打开 " : "Open the "),
    );
    const link = document.createElement("a");
    link.href = "https://gitee.com/profile/personal_access_tokens";
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = t(uiLocale, "token_link");
    g1.appendChild(link);
    g1.append(
      document.createTextNode(
        uiLocale === "zh" ? "（需先登录 Gitee）" : " (sign in to Gitee first)",
      ),
    );
  }

  (document.getElementById("guide_2") as HTMLElement).textContent = t(
    uiLocale,
    "options_guide_2",
  );
  (document.getElementById("guide_3") as HTMLElement).textContent = t(
    uiLocale,
    "options_guide_3",
  );
  (document.getElementById("guide_4") as HTMLElement).textContent = t(
    uiLocale,
    "options_guide_4",
  );
  (document.getElementById("guide_5") as HTMLElement).textContent = t(
    uiLocale,
    "options_guide_5",
  );
  (document.getElementById("label_gitee") as HTMLElement).textContent = t(
    uiLocale,
    "gitee_token_label",
  );
  (document.getElementById("hint_gitee") as HTMLElement).textContent = t(
    uiLocale,
    "gitee_token_hint",
  );
  (document.getElementById("label_github") as HTMLElement).textContent = t(
    uiLocale,
    "github_token_label",
  );
  (document.getElementById("label_poll") as HTMLElement).textContent = t(
    uiLocale,
    "poll_label",
  );
  (document.getElementById("save") as HTMLElement).textContent = t(
    uiLocale,
    "save",
  );
  (document.getElementById("check") as HTMLElement).textContent = t(
    uiLocale,
    "validate_token",
  );
  (document.getElementById("lang_auto") as HTMLElement).textContent = t(
    uiLocale,
    "locale_auto",
  );
  (document.getElementById("lang_zh") as HTMLElement).textContent = t(
    uiLocale,
    "lang_zh",
  );
  (document.getElementById("lang_en") as HTMLElement).textContent = t(
    uiLocale,
    "lang_en",
  );

  document
    .getElementById("lang_auto")
    ?.classList.toggle("active", localePref === "auto");
  document
    .getElementById("lang_zh")
    ?.classList.toggle("active", localePref === "zh");
  document
    .getElementById("lang_en")
    ?.classList.toggle("active", localePref === "en");
}

/**
 * Reloads config and refreshes UI language.
 */
async function refresh(): Promise<void> {
  const config = await sendMessage<AppConfig>({ type: "get_config" });
  localePref = config.locale || "auto";
  uiLocale = resolveLocale(localePref);
  fillForm(config);
  applyChrome();
}

/**
 * Switches language preference and persists it.
 */
async function switchLocale(next: AppConfig["locale"]): Promise<void> {
  localePref = next;
  const config = readForm();
  await sendMessage({ type: "save_config", config });
  uiLocale = resolveLocale(next);
  applyChrome();
}

async function init(): Promise<void> {
  await refresh();

  document.getElementById("lang_auto")?.addEventListener("click", () => {
    void switchLocale("auto");
  });
  document.getElementById("lang_zh")?.addEventListener("click", () => {
    void switchLocale("zh");
  });
  document.getElementById("lang_en")?.addEventListener("click", () => {
    void switchLocale("en");
  });

  document.getElementById("save")?.addEventListener("click", () => {
    void (async () => {
      try {
        await sendMessage({ type: "save_config", config: readForm() });
        setMessage(t(uiLocale, "saved_ok"));
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error);
        setMessage(text, true);
      }
    })();
  });

  document.getElementById("check")?.addEventListener("click", () => {
    void (async () => {
      try {
        await sendMessage({ type: "save_config", config: readForm() });
        const user = await sendMessage<{ login: string }>({
          type: "validate_gitee_token",
        });
        setMessage(`${t(uiLocale, "token_ok")}: ${user.login}`);
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error);
        setMessage(text, true);
      }
    })();
  });
}

void init();

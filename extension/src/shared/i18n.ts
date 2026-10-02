/** Locale and translation helpers for the extension UI. */

export type Locale = "zh" | "en";

export type MessageKey =
  | "app_name"
  | "app_tagline"
  | "lang_zh"
  | "lang_en"
  | "language"
  | "locale_auto"
  | "settings"
  | "check_now"
  | "refresh"
  | "collapse"
  | "open_gitee"
  | "open_setup"
  | "setup_done_refresh"
  | "import_to_gitee"
  | "register_existing"
  | "confirm_imported"
  | "sync_now"
  | "check_updates"
  | "already_in_sync"
  | "in_sync_hint"
  | "check_throttled"
  | "reopen_import"
  | "needs_setup"
  | "panel_setup_hint"
  | "on_page_hint"
  | "gitee_user"
  | "status_not_imported"
  | "status_pending"
  | "status_mapped"
  | "status_running"
  | "status_success"
  | "status_failed"
  | "status_update"
  | "status_manual"
  | "setup_title"
  | "setup_step_1"
  | "setup_step_2"
  | "setup_step_3"
  | "import_hint"
  | "pending_hint"
  | "sync_hint"
  | "opening_import"
  | "import_opened"
  | "registered"
  | "import_confirmed"
  | "checked"
  | "syncing"
  | "token_invalid"
  | "popup_hint"
  | "popup_title"
  | "mappings_title"
  | "mappings_loading"
  | "mappings_empty"
  | "register_title"
  | "register_github_ph"
  | "register_gitee_ph"
  | "register_btn"
  | "remove_mapping"
  | "checking_token"
  | "gitee_account"
  | "token_error"
  | "github_format_error"
  | "options_title"
  | "options_lead"
  | "options_guide_title"
  | "options_guide_1"
  | "options_guide_2"
  | "options_guide_3"
  | "options_guide_4"
  | "options_guide_5"
  | "section_language"
  | "section_tokens"
  | "section_poll"
  | "gitee_token_label"
  | "gitee_token_hint"
  | "github_token_label"
  | "poll_label"
  | "save"
  | "validate_token"
  | "saved_ok"
  | "token_ok"
  | "mini_label"
  | "token_link";

type Dict = Record<MessageKey, string>;

const ZH: Dict = {
  app_name: "GitHub → Gitee",
  app_tagline: "在本页直接备份到 Gitee",
  lang_zh: "中文",
  lang_en: "EN",
  language: "语言",
  locale_auto: "跟随浏览器",
  settings: "设置",
  check_now: "立即检查",
  refresh: "刷新状态",
  collapse: "收起",
  open_gitee: "打开 Gitee",
  open_setup: "打开配置引导",
  setup_done_refresh: "我已配置，刷新",
  import_to_gitee: "导入到 Gitee",
  register_existing: "已导入，登记映射",
  confirm_imported: "确认已导入",
  sync_now: "立即同步",
  check_updates: "检查更新",
  already_in_sync: "已与 GitHub 一致，无需同步。",
  in_sync_hint: "当前已同步。有更新时才会出现「立即同步」。可手动检查（最少间隔 10 分钟，避免 API 限流）。",
  check_throttled: "检查过于频繁，请稍后再试，以降低 API 限流风险。",
  reopen_import: "再次打开导入页",
  needs_setup: "需要先完成配置",
  panel_setup_hint: "请先在扩展设置页填写 Gitee Token，再回来操作。",
  on_page_hint: "在本页直接操作",
  gitee_user: "Gitee",
  status_not_imported: "尚未导入到 Gitee",
  status_pending: "等待确认导入",
  status_mapped: "已映射",
  status_running: "处理中…",
  status_success: "已同步",
  status_failed: "上次失败",
  status_update: "GitHub 有更新",
  status_manual: "需在 Gitee 点同步更新",
  setup_title: "首次使用引导",
  setup_step_1: "打开设置页，粘贴 Gitee 私人令牌",
  setup_step_2: "令牌需有项目/仓库相关权限",
  setup_step_3: "保存后回到本页即可导入",
  import_hint: "将打开 Gitee「从 URL 导入」。公开仓一般可直接导入；完成后可在本面板确认。",
  pending_hint: "请在 Gitee 完成导入后回来确认，或点「立即检查」自动探测。",
  sync_hint: "同步优先调用镜像 API；若不可用将打开仓库页，请点击「同步更新」（可能强制覆盖）。",
  opening_import: "正在打开 Gitee 导入页…",
  import_opened: "已打开导入页。若未自动填入，请粘贴剪贴板中的 GitHub 地址，完成后点「确认已导入」。",
  registered: "已登记映射。",
  import_confirmed: "导入已确认。建议将 Gitee 作为备份仓。",
  checked: "已检查状态。",
  syncing: "正在同步…",
  token_invalid: "Token 无效",
  popup_hint: "查看与管理已导入的仓库映射。语言、Token 等请到设置页修改。",
  popup_title: "映射管理",
  mappings_title: "仓库映射",
  mappings_loading: "加载映射中…",
  mappings_empty: "暂无映射。打开 GitHub 仓库页，用右下角面板导入。",
  register_title: "登记已导入仓库",
  register_github_ph: "github_owner/repo",
  register_gitee_ph: "Gitee 仓库名（可选，默认同名）",
  register_btn: "登记映射",
  remove_mapping: "移除映射",
  checking_token: "正在检查 Gitee Token…",
  gitee_account: "Gitee 账号",
  token_error: "Gitee Token 异常",
  github_format_error: "请使用 github_owner/repo 格式",
  options_title: "设置",
  options_lead: "仅包含全局配置：语言、令牌与检查间隔。仓库导入/同步请在 GitHub 页面板或扩展弹窗中操作。",
  options_guide_title: "Token 配置引导",
  options_guide_1: "打开 Gitee 私人令牌页面（需先登录 Gitee）",
  options_guide_2: "新建令牌，勾选与项目/仓库相关的权限",
  options_guide_3: "复制令牌，粘贴到下方并保存",
  options_guide_4: "点「校验 Token」确认显示你的 Gitee 用户名",
  options_guide_5: "回到 GitHub 仓库页，使用右下角面板操作",
  section_language: "语言",
  section_tokens: "令牌",
  section_poll: "自动检查",
  gitee_token_label: "Gitee access token（必填）",
  gitee_token_hint: "仅保存在本机扩展存储。",
  github_token_label: "GitHub token（可选；公开仓请留空。填错反而会 403）",
  poll_label: "自动检查间隔（分钟，10–60）",
  save: "保存",
  validate_token: "校验 Token",
  saved_ok: "配置已保存。可回到 GitHub 仓库页使用右下角面板。",
  token_ok: "Token 有效，当前 Gitee 用户",
  mini_label: "Gitee 同步",
  token_link: "Gitee 私人令牌",
};

const EN: Dict = {
  app_name: "GitHub → Gitee",
  app_tagline: "Back up this repo to Gitee",
  lang_zh: "中文",
  lang_en: "EN",
  language: "Language",
  locale_auto: "Follow browser",
  settings: "Settings",
  check_now: "Check now",
  refresh: "Refresh",
  collapse: "Collapse",
  open_gitee: "Open Gitee",
  open_setup: "Open setup guide",
  setup_done_refresh: "Configured, refresh",
  import_to_gitee: "Import to Gitee",
  register_existing: "Already imported, register",
  confirm_imported: "Confirm imported",
  sync_now: "Sync now",
  check_updates: "Check for updates",
  already_in_sync: "Already matches GitHub — sync not needed.",
  in_sync_hint: "In sync. Sync now appears only when updates are detected. Manual checks are limited to once every 10 minutes to avoid API rate limits.",
  check_throttled: "Checked recently. Please wait before checking again to avoid API rate limits.",
  reopen_import: "Reopen import page",
  needs_setup: "Setup required",
  panel_setup_hint: "Add your Gitee token in Settings, then return here.",
  on_page_hint: "Operate on this page",
  gitee_user: "Gitee",
  status_not_imported: "Not imported to Gitee yet",
  status_pending: "Waiting for import confirm",
  status_mapped: "Mapped",
  status_running: "Working…",
  status_success: "In sync",
  status_failed: "Last action failed",
  status_update: "GitHub has updates",
  status_manual: "Click Gitee 同步更新",
  setup_title: "First-time setup",
  setup_step_1: "Open Settings and paste your Gitee personal access token",
  setup_step_2: "Token needs project/repository related permissions",
  setup_step_3: "Save, then return here to import",
  import_hint: "Opens Gitee “Import from URL”. Public repos usually work directly; confirm here when done.",
  pending_hint: "Finish import on Gitee, then confirm here — or tap Check now to detect automatically.",
  sync_hint: "Tries mirror API first; otherwise opens the Gitee repo so you can click 同步更新 (may force-overwrite).",
  opening_import: "Opening Gitee import page…",
  import_opened: "Import page opened. Paste the GitHub URL if needed, then tap Confirm imported.",
  registered: "Mapping registered.",
  import_confirmed: "Import confirmed. Prefer Gitee as a backup mirror.",
  checked: "Status checked.",
  syncing: "Syncing…",
  token_invalid: "Invalid token",
  popup_hint: "Manage imported repository mappings. Language and tokens live in Settings.",
  popup_title: "Mappings",
  mappings_title: "Repository mappings",
  mappings_loading: "Loading mappings…",
  mappings_empty: "No mappings yet. Open a GitHub repo and use the bottom-right panel.",
  register_title: "Register an existing import",
  register_github_ph: "github_owner/repo",
  register_gitee_ph: "Gitee repo name (optional)",
  register_btn: "Register",
  remove_mapping: "Remove",
  checking_token: "Checking Gitee token…",
  gitee_account: "Gitee account",
  token_error: "Gitee token error",
  github_format_error: "Use github_owner/repo format",
  options_title: "Settings",
  options_lead: "Global settings only: language, tokens, and check interval. Import/sync happens on the GitHub panel or extension popup.",
  options_guide_title: "Token setup guide",
  options_guide_1: "Open the Gitee personal access tokens page (sign in first)",
  options_guide_2: "Create a token with project/repository permissions",
  options_guide_3: "Copy the token, paste it below, and save",
  options_guide_4: "Click Validate token and confirm your Gitee username",
  options_guide_5: "Return to a GitHub repo page and use the panel",
  section_language: "Language",
  section_tokens: "Tokens",
  section_poll: "Auto-check",
  gitee_token_label: "Gitee access token (required)",
  gitee_token_hint: "Stored only in local extension storage.",
  github_token_label: "GitHub token (optional — leave empty for public repos; a bad token causes 403)",
  poll_label: "Auto-check interval (minutes, 10–60)",
  save: "Save",
  validate_token: "Validate token",
  saved_ok: "Saved. Return to a GitHub repo page to use the panel.",
  token_ok: "Token OK. Gitee user",
  mini_label: "Gitee Sync",
  token_link: "Gitee personal access tokens",
};

const TABLES: Record<Locale, Dict> = { zh: ZH, en: EN };

/**
 * Detects the preferred UI locale from the browser language.
 */
export function detectBrowserLocale(): Locale {
  const lang = (globalThis.navigator?.language || "en").toLowerCase();
  return lang.startsWith("zh") ? "zh" : "en";
}

/**
 * Resolves an effective locale from stored preference or browser default.
 */
export function resolveLocale(stored?: string): Locale {
  if (stored === "zh" || stored === "en") {
    return stored;
  }
  return detectBrowserLocale();
}

/**
 * Translates a message key for the given locale.
 */
export function t(locale: Locale, key: MessageKey): string {
  return TABLES[locale][key] || TABLES.en[key] || key;
}

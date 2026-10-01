/**
 * Gitee page helpers: autofill import URL and highlight force-sync controls.
 */

const BANNER_ID = "github2gitee-gitee-helper";

/**
 * Reads a GitHub clone/page URL from the current query string.
 */
function readUrlQuery(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("url") || params.get("import_url");
}

/**
 * Tries to fill the first matching import URL input on the page.
 */
function autofillImportUrl(value: string): boolean {
  const selectors = [
    'input[name="url"]',
    'input[name="import_url"]',
    'input[name="project[import_url]"]',
    'input#project_import_url',
    'input#import_url',
    'input[placeholder*="http"]',
    'input[type="url"]',
    'input[type="text"]',
  ];

  for (const selector of selectors) {
    const nodes = Array.from(document.querySelectorAll(selector));
    for (const node of nodes) {
      if (!(node instanceof HTMLInputElement)) {
        continue;
      }
      if (node.type === "password" || node.type === "hidden") {
        continue;
      }
      node.focus();
      node.value = value;
      node.dispatchEvent(new Event("input", { bubbles: true }));
      node.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
  }
  return false;
}

/**
 * Highlights elements whose text looks like Gitee force-sync actions.
 */
function highlightSyncControls(): number {
  const candidates = Array.from(
    document.querySelectorAll("a, button, span, div"),
  );
  let count = 0;
  for (const el of candidates) {
    const text = (el.textContent || "").replace(/\s+/g, "");
    if (!text) {
      continue;
    }
    if (
      text.includes("同步更新") ||
      (text.toLowerCase().includes("sync") && text.length < 24)
    ) {
      if (el instanceof HTMLElement) {
        el.style.outline = "2px solid #1f6f4a";
        el.style.outlineOffset = "2px";
        count += 1;
      }
    }
  }
  return count;
}

/**
 * Shows a small helper banner on Gitee pages.
 */
function showBanner(message: string): void {
  if (document.getElementById(BANNER_ID)) {
    return;
  }
  const banner = document.createElement("div");
  banner.id = BANNER_ID;
  banner.textContent = message;
  banner.style.cssText = [
    "position:fixed",
    "z-index:99999",
    "left:12px",
    "bottom:12px",
    "max-width:420px",
    "padding:10px 12px",
    "border-radius:8px",
    "background:#1f6f4a",
    "color:#fff",
    "font:12px/1.4 Segoe UI,sans-serif",
    "box-shadow:0 4px 16px rgba(0,0,0,.2)",
  ].join(";");
  document.body.appendChild(banner);
  window.setTimeout(() => banner.remove(), 12000);
}

function run(): void {
  const path = window.location.pathname;
  const importUrl = readUrlQuery();

  if (path.includes("/projects/import") || path.includes("/import")) {
    if (importUrl) {
      const filled = autofillImportUrl(importUrl);
      showBanner(
        filled
          ? "GitHub2Gitee: import URL filled. Confirm and create on Gitee."
          : `GitHub2Gitee: paste this URL if needed: ${importUrl}`,
      );
    } else {
      showBanner("GitHub2Gitee: open Import from a GitHub repo page for autofill.");
    }
    return;
  }

  // Likely a repository page: owner/repo
  const parts = path.split("/").filter(Boolean);
  if (parts.length >= 2) {
    const highlighted = highlightSyncControls();
    if (highlighted > 0) {
      showBanner(
        "GitHub2Gitee: highlighted sync controls. Click 同步更新 to force sync (may overwrite).",
      );
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => run());
} else {
  run();
  // Gitee pages are often dynamic; retry once shortly after load.
  window.setTimeout(() => run(), 1500);
}

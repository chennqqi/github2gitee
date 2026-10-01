import { defineConfig, type Plugin } from "vite";
import { resolve } from "node:path";
import {
  cpSync,
  mkdirSync,
  rmSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

type BrowserTarget = "chrome" | "edge" | "firefox";
type EntryName =
  | "background"
  | "content"
  | "content-gitee"
  | "popup"
  | "options";

const entries: Record<EntryName, string> = {
  background: resolve(__dirname, "src/background/index.ts"),
  content: resolve(__dirname, "src/content/index.ts"),
  "content-gitee": resolve(__dirname, "src/content/gitee.ts"),
  popup: resolve(__dirname, "src/popup/index.ts"),
  options: resolve(__dirname, "src/options/index.ts"),
};

/**
 * Copies browser-specific manifest, HTML pages, and icons into the output directory.
 */
function extensionPackPlugin(browser: BrowserTarget): Plugin {
  return {
    name: "extension-pack",
    closeBundle() {
      const outDir = resolve(__dirname, `dist/${browser}`);
      mkdirSync(outDir, { recursive: true });

      const manifestName =
        browser === "firefox" ? "manifest.firefox.json" : "manifest.chrome.json";
      const manifestSrc = resolve(__dirname, "manifests", manifestName);
      const manifest = JSON.parse(readFileSync(manifestSrc, "utf-8"));
      writeFileSync(
        resolve(outDir, "manifest.json"),
        JSON.stringify(manifest, null, 2),
        "utf-8",
      );

      for (const page of ["popup", "options"] as const) {
        const htmlSrc = resolve(__dirname, `src/${page}/index.html`);
        const htmlDestDir = resolve(outDir, page);
        mkdirSync(htmlDestDir, { recursive: true });
        let html = readFileSync(htmlSrc, "utf-8");
        html = html.replace(`./index.ts`, `./index.js`);
        writeFileSync(resolve(htmlDestDir, "index.html"), html, "utf-8");
      }

      const iconsSrc = resolve(__dirname, "public/icons");
      if (existsSync(iconsSrc)) {
        cpSync(iconsSrc, resolve(outDir, "icons"), { recursive: true });
      }
    },
  };
}

/**
 * Builds one extension entry as a self-contained IIFE (no cross-chunk imports).
 * Edge/Chromium are more reliable with classic scripts than ES-module content scripts.
 */
export default defineConfig(({ mode }) => {
  const [browserRaw, entryRaw] = mode.split(":");
  const browser = (
    browserRaw === "firefox" || browserRaw === "edge" ? browserRaw : "chrome"
  ) as BrowserTarget;
  const entryName = (entryRaw || "background") as EntryName;
  if (!entries[entryName]) {
    throw new Error(`Unknown entry: ${entryName}`);
  }

  const outDir = resolve(__dirname, `dist/${browser}`);
  const isPage = entryName === "popup" || entryName === "options";
  const isLastEntry = entryName === "options";

  return {
    build: {
      outDir,
      emptyOutDir: false,
      sourcemap: true,
      // Keep each entry self-contained for extension script loading.
      cssCodeSplit: false,
      rollupOptions: {
        input: { [entryName]: entries[entryName] },
        output: {
          format: "iife",
          entryFileNames: (chunk) => {
            if (chunk.name === "background") {
              return "background/index.js";
            }
            if (chunk.name === "content") {
              return "content/index.js";
            }
            if (chunk.name === "content-gitee") {
              return "content/gitee.js";
            }
            if (chunk.name === "popup") {
              return "popup/index.js";
            }
            if (chunk.name === "options") {
              return "options/index.js";
            }
            return "assets/[name].js";
          },
          assetFileNames: "assets/[name][extname]",
          inlineDynamicImports: true,
          name: `github2gitee_${entryName.replace("-", "_")}`,
        },
      },
    },
    plugins: isLastEntry ? [extensionPackPlugin(browser)] : [],
    define: {
      // webextension-polyfill expects a browser-like global in some builds.
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
  };
});

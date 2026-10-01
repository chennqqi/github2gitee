import { spawnSync } from "node:child_process";
import { existsSync, rmSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const browsers = process.argv.slice(2);
const targets = browsers.length > 0 ? browsers : ["chrome", "firefox"];
const entries = ["background", "content", "content-gitee", "popup", "options"];

for (const browser of targets) {
  const outDir = resolve(root, "dist", browser);
  if (existsSync(outDir)) {
    rmSync(outDir, { recursive: true, force: true });
  }
  mkdirSync(outDir, { recursive: true });

  for (const entry of entries) {
    const mode = `${browser}:${entry}`;
    console.log(`Building ${mode}...`);
    const result = spawnSync("npx", ["vite", "build", "--mode", mode], {
      stdio: "inherit",
      cwd: root,
      shell: true,
      env: process.env,
    });
    if (result.status !== 0) {
      console.error(`Build failed for ${mode}`);
      process.exit(result.status ?? 1);
    }
  }
}

console.log("Build complete.");

/**
 * Builds the extension and packs Chrome/Firefox zip artifacts for store upload.
 * Staging copies exclude source maps. Output: extension/release/*.zip
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { platform } from "node:os";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const releaseDir = resolve(root, "release");
const stagingRoot = resolve(releaseDir, ".staging");
const skipBuild = process.argv.includes("--no-build");

/**
 * Returns package version from package.json.
 */
function readVersion() {
  const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf-8"));
  return String(pkg.version || "0.0.0");
}

/**
 * Recursively copies a directory while skipping sourcemap files.
 */
function copyWithoutMaps(src, dest) {
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, {
    recursive: true,
    filter: (source) => !source.endsWith(".map"),
  });
}

/**
 * Creates a zip whose root contains the files of `sourceDir` (not a parent folder).
 */
function zipDirectoryContents(sourceDir, zipPath) {
  if (existsSync(zipPath)) {
    rmSync(zipPath, { force: true });
  }

  if (platform() === "win32") {
    const ps = `
$ErrorActionPreference = 'Stop'
$src = '${sourceDir.replace(/'/g, "''")}'
$dst = '${zipPath.replace(/'/g, "''")}'
if (Test-Path $dst) { Remove-Item -Force $dst }
Compress-Archive -Path (Join-Path $src '*') -DestinationPath $dst -Force
`;
    const result = spawnSync(
      "powershell",
      ["-NoProfile", "-NonInteractive", "-Command", ps],
      { stdio: "inherit", cwd: root },
    );
    if (result.status !== 0) {
      throw new Error(`Compress-Archive failed for ${zipPath}`);
    }
    return;
  }

  const result = spawnSync("zip", ["-r", "-q", zipPath, "."], {
    stdio: "inherit",
    cwd: sourceDir,
  });
  if (result.status !== 0) {
    throw new Error(
      `zip failed for ${zipPath}. Install 'zip' or run on Windows PowerShell.`,
    );
  }
}

/**
 * Validates that a path stays under the extension project root.
 */
function assertUnderRoot(targetPath) {
  const rel = relative(root, targetPath);
  if (rel.startsWith("..") || rel.includes(`..${platform() === "win32" ? "\\" : "/"}`)) {
    throw new Error(`Refusing to touch path outside project: ${targetPath}`);
  }
}

function main() {
  assertUnderRoot(releaseDir);
  assertUnderRoot(stagingRoot);

  if (!skipBuild) {
    console.log("Building chrome + firefox...");
    const build = spawnSync("node", ["scripts/build.mjs", "chrome", "firefox"], {
      stdio: "inherit",
      cwd: root,
      shell: true,
    });
    if (build.status !== 0) {
      process.exit(build.status ?? 1);
    }
  }

  const version = readVersion();
  mkdirSync(releaseDir, { recursive: true });
  if (existsSync(stagingRoot)) {
    rmSync(stagingRoot, { recursive: true, force: true });
  }
  mkdirSync(stagingRoot, { recursive: true });

  const targets = [
    { browser: "chrome", label: "chrome" },
    { browser: "firefox", label: "firefox" },
  ];

  const created = [];
  for (const { browser, label } of targets) {
    const distDir = resolve(root, "dist", browser);
    if (!existsSync(join(distDir, "manifest.json"))) {
      throw new Error(`Missing build output: ${distDir}/manifest.json`);
    }
    const stageDir = resolve(stagingRoot, label);
    copyWithoutMaps(distDir, stageDir);

    const zipName = `github2gitee-${version}-${label}.zip`;
    const zipPath = resolve(releaseDir, zipName);
    assertUnderRoot(zipPath);
    console.log(`Packing ${zipName}...`);
    zipDirectoryContents(stageDir, zipPath);
    created.push(zipPath);
  }

  // Keep a short pointer file for humans / CI.
  const notePath = resolve(releaseDir, "README.txt");
  writeFileSync(
    notePath,
    [
      `github2gitee extension release packages`,
      `version: ${version}`,
      `generated: ${new Date().toISOString()}`,
      ``,
      `Upload *-chrome.zip to Chrome Web Store / Edge Add-ons.`,
      `Upload *-firefox.zip to Firefox AMO.`,
      `Source maps are excluded from these zips.`,
      ``,
      ...created.map((p) => `- ${relative(releaseDir, p)}`),
      ``,
    ].join("\n"),
    "utf-8",
  );

  rmSync(stagingRoot, { recursive: true, force: true });
  console.log("Pack complete:");
  for (const p of created) {
    console.log(" ", p);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

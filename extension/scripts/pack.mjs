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
 * Entry names always use forward slashes — required by Firefox / AMO validation.
 */
function zipDirectoryContents(sourceDir, zipPath) {
  if (existsSync(zipPath)) {
    rmSync(zipPath, { force: true });
  }

  // PowerShell Compress-Archive writes backslash paths (background\index.js),
  // which Firefox rejects. Use Python zipfile with POSIX arcnames instead.
  const py = `
from pathlib import Path
import zipfile
import sys

source = Path(sys.argv[1])
zip_path = Path(sys.argv[2])
if zip_path.exists():
    zip_path.unlink()
names = []
with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
    for path in sorted(source.rglob("*")):
        if not path.is_file():
            continue
        arcname = path.relative_to(source).as_posix()
        if "\\\\" in arcname or arcname.startswith("/"):
            raise SystemExit(f"invalid arcname: {arcname}")
        zf.write(path, arcname)
        names.append(arcname)
raw = zip_path.read_bytes()
if b"background\\\\index" in raw or b"content\\\\index" in raw:
    raise SystemExit("zip raw bytes still contain backslash paths")
print(f"wrote {len(names)} entries -> {zip_path.name}")
for name in names[:5]:
    print(" ", name)
`;

  const result = spawnSync("python", ["-c", py, sourceDir, zipPath], {
    stdio: "inherit",
    cwd: root,
  });
  if (result.status !== 0) {
    throw new Error(
      `Failed to create zip with forward-slash entries: ${zipPath}`,
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
          `Zip entry paths use forward slashes (Firefox-compatible).`,
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

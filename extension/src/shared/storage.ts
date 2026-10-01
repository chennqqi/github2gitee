import browser from "webextension-polyfill";
import { DEFAULT_CONFIG, type AppConfig, type RepoMapping } from "./types";

const CONFIG_KEY = "app_config";
const MAPPINGS_KEY = "repo_mappings";

/**
 * Loads application configuration from extension local storage.
 */
export async function getConfig(): Promise<AppConfig> {
  const result = await browser.storage.local.get(CONFIG_KEY);
  const stored = result[CONFIG_KEY] as Partial<AppConfig> | undefined;
  if (!stored) {
    return { ...DEFAULT_CONFIG };
  }
  const { sync_service_base_url: _removed, ...rest } = stored as Partial<AppConfig> & {
    sync_service_base_url?: string;
  };
  return {
    ...DEFAULT_CONFIG,
    ...rest,
  };
}

/**
 * Persists application configuration to extension local storage.
 */
export async function saveConfig(config: AppConfig): Promise<void> {
  await browser.storage.local.set({ [CONFIG_KEY]: config });
}

/**
 * Returns all repository mappings.
 */
export async function listMappings(): Promise<RepoMapping[]> {
  const result = await browser.storage.local.get(MAPPINGS_KEY);
  const mappings = result[MAPPINGS_KEY] as RepoMapping[] | undefined;
  return mappings ?? [];
}

/**
 * Replaces the full repository mapping list.
 */
export async function saveMappings(mappings: RepoMapping[]): Promise<void> {
  await browser.storage.local.set({ [MAPPINGS_KEY]: mappings });
}

/**
 * Upserts a single repository mapping by id.
 */
export async function upsertMapping(mapping: RepoMapping): Promise<void> {
  const mappings = await listMappings();
  const index = mappings.findIndex((item) => item.id === mapping.id);
  if (index >= 0) {
    mappings[index] = mapping;
  } else {
    mappings.unshift(mapping);
  }
  await saveMappings(mappings);
}

/**
 * Finds a mapping by GitHub owner/repo.
 */
export async function findMappingByGithub(
  owner: string,
  repo: string,
): Promise<RepoMapping | undefined> {
  const mappings = await listMappings();
  return mappings.find(
    (item) =>
      item.github_owner.toLowerCase() === owner.toLowerCase() &&
      item.github_repo.toLowerCase() === repo.toLowerCase(),
  );
}

/**
 * Removes a mapping by id without deleting the remote Gitee repository.
 */
export async function removeMapping(id: string): Promise<void> {
  const mappings = await listMappings();
  await saveMappings(mappings.filter((item) => item.id !== id));
}

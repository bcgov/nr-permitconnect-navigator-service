import axios from 'axios';

import { StorageKey } from '@/utils/enums/application';

import type { Config } from '@/types';

const storageType = window.sessionStorage;
const CONFIG_URL = '/config';

/**
 * Reads the cached config from sessionStorage.
 * @returns The cached Config object or null if not present/invalid.
 */
function readCachedConfig(): Config | null {
  const raw = storageType.getItem(StorageKey.CONFIG);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as Config;
  } catch {
    storageType.removeItem(StorageKey.CONFIG);
    return null;
  }
}

/**
 * Writes config to sessionStorage.
 * @param config - The configuration object to persist.
 */
function writeCachedConfig(config: Config): void {
  storageType.setItem(StorageKey.CONFIG, JSON.stringify(config));
}

/**
 * Retrieves application configuration.
 *
 * This function first attempts to read the configuration from sessionStorage.
 * If not available, it fetches the configuration from the API and caches it.
 *
 * @returns A promise resolving to the application Config.
 */
export async function getConfig(): Promise<Config> {
  const cached = readCachedConfig();
  if (cached) return cached;

  const { data } = await axios.get<Config>(CONFIG_URL, {
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache'
    }
  });

  writeCachedConfig(data);
  return data;
}

/**
 * Forces a refresh of the configuration from the API,
 * bypassing any cached sessionStorage value.
 * @returns A promise resolving to the refreshed Config.
 */
export async function refreshConfig(): Promise<Config> {
  const { data } = await axios.get<Config>(CONFIG_URL, {
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache'
    }
  });

  writeCachedConfig(data);
  return data;
}

/**
 * Retrieves the cached configuration without triggering an API call.
 * @returns The cached Config object or null if not available.
 */
export function getCachedConfig(): Config | null {
  return readCachedConfig();
}

/** Hybrid default export object for backward compatibility */
export const configService = {
  getConfig,
  refreshConfig,
  getCachedConfig
};

import axios from 'axios';

import { getConfig, refreshConfig, getCachedConfig, configService } from '@/services/configService';
import { StorageKey } from '@/utils/enums/application';

vi.mock('axios', () => ({
  default: {
    get: vi.fn()
  }
}));

describe('configService', () => {
  const mockGet = vi.mocked(axios.get);

  const config = {
    apiUrl: 'https://api.example.com',
    featureFlag: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  describe('getConfig', () => {
    it('returns cached config when present', async () => {
      window.sessionStorage.setItem(StorageKey.CONFIG, JSON.stringify(config));

      const result = await getConfig();

      expect(mockGet).not.toHaveBeenCalled();

      expect(result).toEqual(config);
    });

    it('fetches config from api when cache is empty', async () => {
      mockGet.mockResolvedValue({
        data: config
      });

      const result = await getConfig();

      expect(mockGet).toHaveBeenCalledWith('/config', {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });

      expect(result).toEqual(config);

      expect(JSON.parse(window.sessionStorage.getItem(StorageKey.CONFIG) as string)).toEqual(config);
    });

    it('removes invalid cached config and fetches from api', async () => {
      window.sessionStorage.setItem(StorageKey.CONFIG, '{invalid-json');

      mockGet.mockResolvedValue({
        data: config
      });

      const result = await getConfig();

      expect(mockGet).toHaveBeenCalledWith('/config', {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });

      expect(result).toEqual(config);

      expect(JSON.parse(window.sessionStorage.getItem(StorageKey.CONFIG) as string)).toEqual(config);
    });

    it('propagates api errors', async () => {
      const error = new Error('get config failed');

      mockGet.mockRejectedValue(error);

      await expect(getConfig()).rejects.toThrow(error);
    });
  });

  describe('refreshConfig', () => {
    it('always fetches config from api even when cache exists', async () => {
      const cachedConfig = {
        apiUrl: 'https://old.example.com'
      };

      window.sessionStorage.setItem(StorageKey.CONFIG, JSON.stringify(cachedConfig));

      mockGet.mockResolvedValue({
        data: config
      });

      const result = await refreshConfig();

      expect(mockGet).toHaveBeenCalledWith('/config', {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache'
        }
      });

      expect(result).toEqual(config);

      expect(JSON.parse(window.sessionStorage.getItem(StorageKey.CONFIG) as string)).toEqual(config);
    });

    it('overwrites existing cached config', async () => {
      window.sessionStorage.setItem(
        StorageKey.CONFIG,
        JSON.stringify({
          apiUrl: 'https://old.example.com'
        })
      );

      mockGet.mockResolvedValue({
        data: config
      });

      await refreshConfig();

      expect(JSON.parse(window.sessionStorage.getItem(StorageKey.CONFIG) as string)).toEqual(config);
    });

    it('propagates api errors', async () => {
      const error = new Error('refresh failed');

      mockGet.mockRejectedValue(error);

      await expect(refreshConfig()).rejects.toThrow(error);
    });
  });

  describe('getCachedConfig', () => {
    it('returns cached config when present', () => {
      window.sessionStorage.setItem(StorageKey.CONFIG, JSON.stringify(config));

      const result = getCachedConfig();

      expect(result).toEqual(config);
    });

    it('returns null when cache is empty', () => {
      expect(getCachedConfig()).toBeNull();
    });

    it('returns null and removes invalid cache when json is malformed', () => {
      window.sessionStorage.setItem(StorageKey.CONFIG, '{invalid-json');

      const result = getCachedConfig();

      expect(result).toBeNull();

      expect(window.sessionStorage.getItem(StorageKey.CONFIG)).toBeNull();
    });
  });

  it('exports all service functions', () => {
    expect(configService).toEqual({
      getConfig,
      refreshConfig,
      getCachedConfig
    });
  });
});

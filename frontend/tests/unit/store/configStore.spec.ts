import { createPinia, setActivePinia } from 'pinia';

import { configService } from '@/services/configService';
import { useConfigStore } from '@/store/configStore';

vi.mock('@/services/configService', () => ({
  configService: {
    getConfig: vi.fn()
  }
}));

describe('configStore', () => {
  const mockGetConfig = vi.mocked(configService.getConfig);

  beforeEach(() => {
    vi.clearAllMocks();

    setActivePinia(createPinia());
  });

  describe('initial state', () => {
    it('initializes with null config', () => {
      const store = useConfigStore();

      expect(store.config).toBeNull();
      expect(store.getConfig).toBeNull();
    });
  });

  describe('getConfig', () => {
    it('returns the current config state', () => {
      const store = useConfigStore();

      const config = {
        apiUrl: 'https://api.example.com',
        featureFlag: true
      };

      store.config = config as never;

      expect(store.getConfig).toEqual(config);
    });

    it('updates when config changes', () => {
      const store = useConfigStore();

      const configA = {
        apiUrl: 'https://a.example.com'
      };

      const configB = {
        apiUrl: 'https://b.example.com'
      };

      store.config = configA as never;

      expect(store.getConfig).toEqual(configA);

      store.config = configB as never;

      expect(store.getConfig).toEqual(configB);
    });
  });

  describe('init', () => {
    it('loads config from the service', async () => {
      const config = {
        apiUrl: 'https://api.example.com',
        featureFlag: true
      };

      mockGetConfig.mockResolvedValue(config as never);

      const store = useConfigStore();

      await store.init();

      expect(mockGetConfig).toHaveBeenCalledTimes(1);

      expect(store.config).toEqual(config);
      expect(store.getConfig).toEqual(config);
    });

    it('replaces an existing config value', async () => {
      const store = useConfigStore();

      store.config = {
        apiUrl: 'https://old.example.com'
      } as never;

      const newConfig = {
        apiUrl: 'https://new.example.com'
      };

      mockGetConfig.mockResolvedValue(newConfig as never);

      await store.init();

      expect(store.config).toEqual(newConfig);
      expect(store.getConfig).toEqual(newConfig);
    });

    it('propagates service errors', async () => {
      const error = new Error('config load failed');

      mockGetConfig.mockRejectedValue(error);

      const store = useConfigStore();

      await expect(store.init()).rejects.toThrow(error);

      expect(store.config).toBeNull();
      expect(store.getConfig).toBeNull();
    });

    it('does not modify existing state when service fails', async () => {
      const store = useConfigStore();

      const existingConfig = {
        apiUrl: 'https://existing.example.com'
      };

      store.config = existingConfig as never;

      mockGetConfig.mockRejectedValue(new Error('config load failed'));

      await expect(store.init()).rejects.toThrow();

      expect(store.config).toEqual(existingConfig);
      expect(store.getConfig).toEqual(existingConfig);
    });
  });
});

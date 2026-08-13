import { appAxios, comsAxios, geocoderAxios, orgBookAxios } from '@/services/interceptors';
import { configService } from '@/services/configService';

import type { Config } from '@/types';
import type { InternalAxiosRequestConfig } from 'axios';

// Mocks

const getUserMock = vi.fn();

vi.mock('@/services/authService', () => ({
  default: class {
    getUser = getUserMock;
  }
}));

vi.mock('@/services/configService', () => ({
  configService: { getCachedConfig: vi.fn() }
}));

// Fixtures

const baseConfig: Config = {
  features: {},
  gitRev: 'abc123',
  idpList: [],
  apiPath: 'api/v1',
  ches: { roadmap: {}, submission: {} },
  coms: { apiPath: 'https://coms.example.com' },
  geocoder: { apiPath: 'https://geocoder.example.com' },
  oidc: {},
  openStreetMap: {},
  orgbook: { apiPath: 'https://orgbook.example.com' }
} as Config;

function requestConfig(): InternalAxiosRequestConfig {
  return { headers: {} } as InternalAxiosRequestConfig;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('interceptors', () => {
  describe('config guard', () => {
    it.each([
      ['appAxios', appAxios],
      ['comsAxios', comsAxios],
      ['geocoderAxios', geocoderAxios],
      ['orgBookAxios', orgBookAxios]
    ])('%s throws when no cached config is available', (_name, factory) => {
      vi.mocked(configService.getCachedConfig).mockReturnValue(null);

      expect(() => factory()).toThrow('Unable to obtain config');
    });
  });

  describe('appAxios', () => {
    beforeEach(() => {
      vi.mocked(configService.getCachedConfig).mockReturnValue(baseConfig);
    });

    it('builds an instance from the app api path and a 10s timeout', () => {
      const instance = appAxios();

      expect(instance.defaults.baseURL).toBe(`${window.location.origin}/api/v1`);
      expect(instance.defaults.timeout).toBe(10000);
    });

    it('lets caller options override the defaults', () => {
      const instance = appAxios({ timeout: 5000 });

      expect(instance.defaults.timeout).toBe(5000);
    });

    it('attaches a bearer token when a non-expired user is present', async () => {
      getUserMock.mockResolvedValue({ access_token: 'tok-123', expired: false });

      const instance = appAxios();
      const handler = instance.interceptors.request as unknown as {
        handlers: { fulfilled: (cfg: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> }[];
      };

      const result = await handler.handlers[0]!.fulfilled(requestConfig());

      expect(result.headers.Authorization).toBe('Bearer tok-123');
    });

    it('does not attach a token when the user is expired', async () => {
      getUserMock.mockResolvedValue({ access_token: 'tok-123', expired: true });

      const instance = appAxios();
      const handler = instance.interceptors.request as unknown as {
        handlers: { fulfilled: (cfg: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> }[];
      };

      const result = await handler.handlers[0]!.fulfilled(requestConfig());

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('does not attach a token when there is no user', async () => {
      getUserMock.mockResolvedValue(null);

      const instance = appAxios();
      const handler = instance.interceptors.request as unknown as {
        handlers: { fulfilled: (cfg: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> }[];
      };

      const result = await handler.handlers[0]!.fulfilled(requestConfig());

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('rejects with the original error on request failure', async () => {
      const instance = appAxios();
      const handler = instance.interceptors.request as unknown as {
        handlers: { rejected: (error: Error) => Promise<never> }[];
      };
      const error = new Error('boom');

      await expect(handler.handlers[0]!.rejected(error)).rejects.toBe(error);
    });
  });

  describe('comsAxios', () => {
    it('builds an instance from the coms api path', () => {
      vi.mocked(configService.getCachedConfig).mockReturnValue(baseConfig);

      const instance = comsAxios();

      expect(instance.defaults.baseURL).toBe('https://coms.example.com');
    });
  });

  describe('geocoderAxios', () => {
    beforeEach(() => {
      vi.mocked(configService.getCachedConfig).mockReturnValue(baseConfig);
    });

    it('builds an instance from the geocoder api path', () => {
      const instance = geocoderAxios();

      expect(instance.defaults.baseURL).toBe('https://geocoder.example.com');
    });

    it('encodes spaces in query params as %20 instead of +', () => {
      const instance = geocoderAxios();

      const encoded = instance.defaults.paramsSerializer as unknown as { encode: (param: string) => string };
      expect(encoded.encode('123 Main St')).toBe('123%20Main%20St');
    });

    it('does not attach an Authorization header', async () => {
      const instance = geocoderAxios();
      const handler = instance.interceptors.request as unknown as {
        handlers: { fulfilled: (cfg: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> }[];
      };

      const result = await handler.handlers[0]!.fulfilled(requestConfig());

      expect(result.headers.Authorization).toBeUndefined();
      expect(getUserMock).not.toHaveBeenCalled();
    });
  });

  describe('orgBookAxios', () => {
    it('builds an instance from the orgbook api path', () => {
      vi.mocked(configService.getCachedConfig).mockReturnValue(baseConfig);

      const instance = orgBookAxios();

      expect(instance.defaults.baseURL).toBe('https://orgbook.example.com');
    });
  });
});

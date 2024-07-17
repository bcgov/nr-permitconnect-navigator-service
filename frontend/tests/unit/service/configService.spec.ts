import axios from 'axios';

import { ConfigService } from '@/services';
import { StorageKey } from '@/utils/enums/application';

const storageType = window.sessionStorage;

const testData: string = 'testData';
const PATH = '/config';
const axiosConfig = {
  headers: {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache'
  }
};
const getSpy = vi.fn();
const putSpy = vi.fn();

vi.mock('axios');
vi.mocked(axios).mockReturnValue({
  get: getSpy,
  put: putSpy
} as any);

beforeEach(() => {
  sessionStorage.setItem(
    StorageKey.CONFIG,
    JSON.stringify({
      oidc: {
        authority: 'abc',
        clientId: '123'
      }
    })
  );

  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('Config Store', () => {
  beforeEach(() => {
    storageType.clear();
  });

  describe('init', () => {
    it('initializes with sessionStorage null', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: testData });

      await ConfigService.init();

      expect(axios.get).toHaveBeenCalledOnce();
      expect(axios.get).toHaveBeenCalledWith(PATH, axiosConfig);
      expect(storageType.getItem(StorageKey.CONFIG)).toBe(`"${testData}"`);
    });

    it('initializes with sessionStorage not null', async () => {
      const testData2 = 'testData2';
      storageType.setItem(StorageKey.CONFIG, testData2);

      await ConfigService.init();

      expect(axios.get).not.toHaveBeenCalled();
      expect(storageType.getItem(StorageKey.CONFIG)).toBe(`${testData2}`);
    });

    it('fails the init get request', () => {
      vi.mocked(axios.get).mockImplementation(() => Promise.reject('errTest'));

      ConfigService.init().catch(() => {
        expect(storageType.getItem(StorageKey.CONFIG)).toBeNull();
      });
    });

    it('gets information from getConfig()', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: testData });

      const configService = await ConfigService.init();

      expect(configService.getConfig()).toBe(testData);
    });

    it('getConfig reaquires missing config', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: testData });

      const configService = await ConfigService.init();

      storageType.removeItem(StorageKey.CONFIG);
      expect(configService.getConfig()).toBeNull();
    });

    it('getConfig fails to reaquire missing config', async () => {
      vi.mocked(axios.get)
        .mockResolvedValueOnce({
          data: testData
        })
        .mockRejectedValueOnce(() =>
          Promise.reject({
            data: testData
          })
        );

      const configService = await ConfigService.init();

      storageType.removeItem(StorageKey.CONFIG);
      expect(configService.getConfig()).toBeNull();
    });
  });
});

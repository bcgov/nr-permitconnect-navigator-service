import axios from 'axios';

import { ConfigService } from '@/services';
import { StorageKey } from '@/utils/constants';

const storageType = window.sessionStorage;

const testData = 'testData';
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
    it('initializes the service', async () => {
      // sessionStorage is null

      vi.mocked(axios.get).mockImplementation(() =>
        Promise.resolve({
          data: testData
        })
      );

      await ConfigService.init();
      expect(storageType.getItem(StorageKey.CONFIG)).toBe(`"${testData}"`);
    });

    it('gets information from getConfig()', async () => {
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.resolve({
          data: testData
        })
      );
      const configService = await ConfigService.init();
      expect(configService.getConfig()).toBe(testData);
    });
  });
});

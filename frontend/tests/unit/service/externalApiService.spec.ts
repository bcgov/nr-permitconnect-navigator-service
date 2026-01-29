import { externalApiService } from '@/services';
import { geocoderAxios, orgBookAxios } from '@/services/interceptors';
import { ADDRESS_CODER_QUERY_PARAMS, ORG_BOOK_QUERY_PARAMS } from '@/utils/constants/housing';

import type { AxiosInstance } from 'axios';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const getSpy = vi.fn();
const testData = 'testDatas';
const testAddressString = '2975 Imaginary Ave';

vi.mock('@/services/interceptors');
vi.mocked(geocoderAxios).mockReturnValue({
  get: getSpy
} as unknown as AxiosInstance);
vi.mocked(orgBookAxios).mockReturnValue({
  get: getSpy
} as unknown as AxiosInstance);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('externalApiService tests', () => {
  it('calls geocoderAxios with the right params', async () => {
    const geocoderSpy = vi.mocked(geocoderAxios().get).mockReturnValue(Promise.resolve({ data: testData }));
    await externalApiService.searchAddressCoder(testAddressString);

    expect(geocoderSpy).toBeCalledTimes(1);
    expect(geocoderSpy).toHaveBeenCalledWith('/addresses.json', {
      params: {
        addressString: testAddressString,
        ...ADDRESS_CODER_QUERY_PARAMS
      }
    });
  });

  it('calls orgBookAxios with the right params', async () => {
    const orgBookSpy = vi.mocked(orgBookAxios().get).mockReturnValue(Promise.resolve({ data: testData }));
    await externalApiService.searchOrgBook(testAddressString);

    expect(orgBookSpy).toBeCalledTimes(1);
    expect(orgBookSpy).toHaveBeenCalledWith('/search/autocomplete', {
      params: {
        q: testAddressString,
        ...ORG_BOOK_QUERY_PARAMS
      }
    });
  });
});

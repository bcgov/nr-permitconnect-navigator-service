import type { Mocked } from 'vitest';
import axios from 'axios';
import config from 'config';

import * as ssoService from '../../../src/external/sso.ts';

vi.mock('config');
let mockedConfig = config as Mocked<typeof config>;

vi.mock('axios');
let mockedAxios = axios as Mocked<typeof axios>;

const FAKE_PERSON = {
  firstName: 'Test',
  lastName: 'Person',
  email: 'test@test.com'
};

beforeEach(() => {
  mockedConfig = config as Mocked<typeof config>;
  mockedAxios = axios as Mocked<typeof axios>;

  // Replace any instances with the mocked instance
  mockedAxios.create.mockImplementation(() => mockedAxios);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockedAxios.interceptors.request.use as any).mockImplementation((cfg: any) => {
    return cfg;
  });
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('searchIdirUsers', () => {
  it('calls GET /${env}/azure-idir/users with correct params and returns result', async () => {
    mockedConfig.get.mockReturnValue('TEST');

    mockedAxios.get.mockResolvedValueOnce({
      data: { data: FAKE_PERSON },
      status: 200
    });

    const response = await ssoService.searchIdirUsers(FAKE_PERSON);

    expect(mockedAxios.get).toHaveBeenCalledWith('/TEST/azure-idir/users', {
      params: FAKE_PERSON
    });
    expect(response).toStrictEqual({
      data: FAKE_PERSON,
      status: 200
    });
  });
});

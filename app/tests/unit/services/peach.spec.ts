import axios from 'axios';
import config from 'config';

import { getPeachRecord } from '../../../src/external/peach.ts';
import Problem from '../../../src/utils/problem.ts';

import type { Mocked } from 'vitest';

vi.mock('config');
let mockedConfig = config as Mocked<typeof config>;

vi.mock('axios');
let mockedAxios = axios as Mocked<typeof axios>;

beforeEach(() => {
  mockedConfig = config as Mocked<typeof config>;
  mockedAxios = axios as Mocked<typeof axios>;

  // Replace any instances with the mocked instance
  mockedAxios.create.mockImplementation(() => mockedAxios);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockedAxios.interceptors.request.use as any).mockImplementation((cfg: any) => cfg);
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('getPeachRecord', () => {
  it('calls GET /records with record_id/system_id params and returns data', async () => {
    mockedConfig.get.mockReturnValue('https://example.com');
    const expected = { record_id: 'rec-1', system_id: 'sys-1' };
    mockedAxios.get.mockResolvedValueOnce({ data: expected });

    const result = await getPeachRecord('rec-1', 'sys-1');

    expect(mockedAxios.get).toHaveBeenCalledWith('/records', {
      params: { record_id: 'rec-1', system_id: 'sys-1' }
    });
    expect(result).toStrictEqual(expected);
  });

  it('omits systemId by passing undefined when not provided', async () => {
    mockedConfig.get.mockReturnValue('https://example.com');
    mockedAxios.get.mockResolvedValueOnce({ data: { record_id: 'rec-2' } });

    await getPeachRecord('rec-2');

    expect(mockedAxios.get).toHaveBeenCalledWith('/records', {
      params: { record_id: 'rec-2', system_id: undefined }
    });
  });

  it('throws a Problem with the response status and detail when axios returns an AxiosError', async () => {
    mockedConfig.get.mockReturnValue('https://example.com');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockedAxios.isAxiosError as unknown as Mocked<any>).mockReturnValue(true);

    const axiosError = {
      response: {
        status: 404,
        data: { detail: 'not found' }
      }
    };
    mockedAxios.get.mockRejectedValueOnce(axiosError);

    await expect(getPeachRecord('rec-x')).rejects.toMatchObject({
      status: 404,
      detail: 'not found'
    });
  });

  it('throws a Problem with status 500 when AxiosError has no response', async () => {
    mockedConfig.get.mockReturnValue('https://example.com');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockedAxios.isAxiosError as unknown as Mocked<any>).mockReturnValue(true);

    mockedAxios.get.mockRejectedValueOnce({ response: undefined });

    await expect(getPeachRecord('rec-y')).rejects.toBeInstanceOf(Problem);
    await expect(getPeachRecord('rec-y')).rejects.toMatchObject({ status: 500 });
  });

  it('throws a generic 500 Problem when the error is not an AxiosError', async () => {
    mockedConfig.get.mockReturnValue('https://example.com');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockedAxios.isAxiosError as unknown as Mocked<any>).mockReturnValue(false);

    mockedAxios.get.mockRejectedValueOnce(new Error('boom'));

    await expect(getPeachRecord('rec-z')).rejects.toMatchObject({
      status: 500,
      detail: 'Server Error'
    });
  });
});

import type { AxiosRequestHeaders, AxiosResponse } from 'axios';

/*
 * Create a function to easily create any required axios response necessary for the given type
 */
export function mockAxiosResponse<T>(data: T, status = 200, statusText = 'OK'): AxiosResponse<T> {
  return {
    data: data,
    status,
    statusText,
    headers: {},
    config: {
      headers: {} as AxiosRequestHeaders
    }
  };
}

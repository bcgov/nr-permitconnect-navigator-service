import { appAxios } from './interceptors';

import type { AxiosRequestConfig } from 'axios';

/**
 * High-level API client that returns only response data.
 *
 * This abstraction hides HTTP transport details and exposes a simplified
 * interface for service-layer usage.
 *
 * Use this as the default for application logic where only the response
 * payload is needed.
 *
 * - Strips AxiosResponse wrapper
 * - Returns `T` directly
 * - Does not expose status codes or headers
 *
 * For cases where HTTP metadata (status, headers, config) is required,
 * use `apiRaw` instead.
 */
export const api = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return (await appAxios().get<T>(url, config)).data;
  },

  async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return (await appAxios().post<T>(url, body, config)).data;
  },

  async put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return (await appAxios().put<T>(url, body, config)).data;
  },

  async patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return (await appAxios().patch<T>(url, body, config)).data;
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return await (
      await appAxios().delete(url, config)
    ).data;
  }
};

/**
 * Low-level API client that exposes full Axios responses.
 *
 * This is a thin wrapper around `appAxios` and preserves the complete
 * `AxiosResponse`, including:
 *
 * - response data
 * - HTTP status codes
 * - response headers
 * - request config
 *
 * Use this only when HTTP metadata is required (e.g. pagination headers,
 * file downloads, conditional logic based on status codes).
 *
 * Prefer `api` for standard application requests.
 */
export const apiRaw = {
  get<T>(url: string, config?: AxiosRequestConfig) {
    return appAxios().get<T>(url, config);
  },

  post<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
    return appAxios().post<T>(url, body, config);
  },

  put<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
    return appAxios().put<T>(url, body, config);
  },

  patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
    return appAxios().patch<T>(url, body, config);
  },

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return appAxios().delete<T>(url, config);
  }
};

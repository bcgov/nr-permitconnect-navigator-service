import axios from 'axios';

import { AuthService, ConfigService } from './index';

import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// Axios serializes query params and encodes spaces with '+'
// Some external APIs may require spaces to be encoded with '%20 instead
const paramRegex = /\+/g;
const paramsSerializer = {
  encode: (param: string) => encodeURIComponent(param).replace(paramRegex, '%20')
};

/**
 * @function appAxios
 * Returns an Axios instance for the application API
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
 */
export function appAxios(options: AxiosRequestConfig = {}): AxiosInstance {
  const instance = axios.create({
    baseURL: window.location.origin + `/${new ConfigService().getConfig().apiPath}`,
    timeout: 10000,
    ...options
  });

  instance.interceptors.request.use(
    async (cfg: InternalAxiosRequestConfig) => {
      const authService = new AuthService();
      const user = await authService.getUser();
      if (!!user && !user.expired) {
        cfg.headers.Authorization = `Bearer ${user.access_token}`;
      }
      return Promise.resolve(cfg);
    },
    (error: Error) => {
      return Promise.reject(error);
    }
  );

  return instance;
}

/**
 * @function comsAxios
 * Returns an Axios instance for the COMS API
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
 */
export function comsAxios(options: AxiosRequestConfig = {}): AxiosInstance {
  const instance = axios.create({
    baseURL: new ConfigService().getConfig().coms.apiPath,
    timeout: 10000,
    ...options
  });

  instance.interceptors.request.use(
    async (cfg: InternalAxiosRequestConfig) => {
      const authService = new AuthService();
      const user = await authService.getUser();
      if (!!user && !user.expired) {
        cfg.headers.Authorization = `Bearer ${user.access_token}`;
      }
      return Promise.resolve(cfg);
    },
    (error: Error) => {
      return Promise.reject(error);
    }
  );

  return instance;
}

/**
 * @function geocoderAxios
 * Returns an Axios instance for the BC Geocoder API
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
 */
export function geocoderAxios(options: AxiosRequestConfig = {}): AxiosInstance {
  const instance = axios.create({
    baseURL: new ConfigService().getConfig().geocoder.apiPath,
    timeout: 10000,
    paramsSerializer,
    ...options
  });

  instance.interceptors.request.use(
    async (cfg: InternalAxiosRequestConfig) => {
      return Promise.resolve(cfg);
    },
    (error: Error) => {
      return Promise.reject(error);
    }
  );

  return instance;
}

/**
 * @function orgbookAxios
 * Returns an Axios instance for the BC Org Book API
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
 */
export function orgBookAxios(options: AxiosRequestConfig = {}): AxiosInstance {
  const instance = axios.create({
    baseURL: new ConfigService().getConfig().orgbook.apiPath,
    timeout: 10000,
    paramsSerializer,
    ...options
  });
  instance.interceptors.request.use(
    async (cfg: InternalAxiosRequestConfig) => {
      return Promise.resolve(cfg);
    },
    (error: Error) => {
      return Promise.reject(error);
    }
  );

  return instance;
}

// /**
//  * @function openMapsAxios
//  * Returns an Axios instance for the openMaps API
//  * @param {AxiosRequestConfig} options Axios request config options
//  * @returns {AxiosInstance} An axios instance
//  */
// export function openMapsAxios(options: AxiosRequestConfig = {}): AxiosInstance {
//   console.log('openMapsAxios');
//   console.log(window);
//   console.log(window.location);
//   const instance = axios.create({
//     baseURL: new ConfigService().getConfig().openMaps.apiPath,
//     timeout: 10000,
//     headers: {
//       'Access-Control-Allow-Origin': window.location.origin,
//       'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin,Origin',
//       'Access-Control-Allow-Methods': 'GET,OPTIONS'
//     },
//     withCredentials: false,
//     ...options
//   });
//   instance.interceptors.request.use(
//     async (cfg: InternalAxiosRequestConfig) => {
//       return Promise.resolve(cfg);
//     },
//     (error: Error) => {
//       return Promise.reject(error);
//     }
//   );

//   return instance;
// }

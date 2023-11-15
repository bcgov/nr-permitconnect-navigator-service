/* eslint-disable no-useless-catch */
import axios from 'axios';
import config from 'config';

import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

/**
 * @function chefsAxios
 * Returns an Axios instance for the CHEFS API
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
 */
function chefsAxios(options: AxiosRequestConfig = {}): AxiosInstance {
  const instance = axios.create({
    baseURL: config.get('frontend.chefs.apiPath'),
    timeout: 10000,
    ...options
  });

  instance.interceptors.request.use(
    async (cfg: InternalAxiosRequestConfig) => {
      cfg.auth = { username: config.get('frontend.chefs.formId'), password: config.get('frontend.chefs.formApiKey') };
      return Promise.resolve(cfg);
    },
    (error: Error) => {
      return Promise.reject(error);
    }
  );

  return instance;
}

const service = {
  exportSubmissions: async (formId: string) => {
    try {
      const response = await chefsAxios().get(`forms/${formId}/export`);
      console.log(response);
      return response.data;
    } catch (e: unknown) {
      throw e;
    }
  },

  getFormSubmissions: async (formId: string) => {
    try {
      const response = await chefsAxios().get(`forms/${formId}/submissions`);
      return response.data;
    } catch (e: unknown) {
      throw e;
    }
  },

  getPublishedVersion: async (formId: string) => {
    try {
      const response = await chefsAxios().get(`forms/${formId}/version`);
      return response.data;
    } catch (e: unknown) {
      throw e;
    }
  },

  getSubmission: async (formSubmissionId: string) => {
    try {
      const response = await chefsAxios().get(`submissions/${formSubmissionId}`);
      return response.data;
    } catch (e: unknown) {
      throw e;
    }
  },

  getVersion: async (formId: string, versionId: string) => {
    try {
      const response = await chefsAxios().get(`forms/${formId}/versions/${versionId}`);
      return response.data;
    } catch (e: unknown) {
      throw e;
    }
  },

  getVersionFields: async (formId: string, versionId: string) => {
    try {
      const response = await chefsAxios().get(`forms/${formId}/versions/${versionId}/fields`);
      return response.data;
    } catch (e: unknown) {
      throw e;
    }
  },

  getVersionSubmissions: async (formId: string, versionId: string) => {
    try {
      const response = await chefsAxios().get(`forms/${formId}/versions/${versionId}/submissions`);
      return response.data;
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;

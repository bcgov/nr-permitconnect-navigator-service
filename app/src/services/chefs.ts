/* eslint-disable no-useless-catch */
import axios from 'axios';
import config from 'config';

import { getChefsApiKey } from '../components/utils';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * @function chefsAxios
 * Returns an Axios instance for the CHEFS API
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
 */
function chefsAxios(formId: string, options: AxiosRequestConfig = {}): AxiosInstance {
  return axios.create({
    baseURL: config.get('frontend.chefs.apiPath'),
    timeout: 10000,
    auth: { username: formId, password: getChefsApiKey(formId) ?? '' },
    ...options
  });
}

const service = {
  getFormExport: async (formId: string) => {
    try {
      const response = await chefsAxios(formId).get(`forms/${formId}/export`, {
        params: { format: 'json', type: 'submissions' }
      });
      return response.data;
    } catch (e: unknown) {
      throw e;
    }
  },

  getSubmission: async (formId: string, formSubmissionId: string) => {
    try {
      const response = await chefsAxios(formId).get(`submissions/${formSubmissionId}`);
      return response.data;
    } catch (e: unknown) {
      throw e;
    }
  },

  getSubmissionStatus: async (formId: string, formSubmissionId: string) => {
    try {
      const response = await chefsAxios(formId).get(`submissions/${formSubmissionId}/status`);
      return response.data;
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;

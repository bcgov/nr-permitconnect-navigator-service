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
    ...options,
    auth: { username: formId, password: getChefsApiKey(formId) ?? '' }
  });
}

const service = {
  getFormSubmissions: async (formId: string) => {
    try {
      const response = await chefsAxios(formId).get(`forms/${formId}/submissions`);
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
  }
};

export default service;

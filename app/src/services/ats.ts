import axios from 'axios';
import config from 'config';

import type { AxiosInstance } from 'axios';
import type { ATSClientResource, ATSEnquiryResource, ATSUserSearchParameters } from '../types';

/**
 * @function getToken
 * Gets Auth token using ATS client credentials
 * @returns
 */
async function getToken() {
  const response = await axios({
    method: 'GET',
    url: config.get('server.ats.tokenUrl'),
    auth: {
      username: config.get('server.ats.clientId') as string,
      password: config.get('server.ats.clientSecret') as string
    },
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    withCredentials: true
  });

  return response.data.access_token;
}

/**
 * @function atsAxios
 * Returns an Axios instance with Authorization header
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
 */
function atsAxios(): AxiosInstance {
  // Create axios instance
  const atsAxios = axios.create({
    baseURL: config.get('server.ats.apiPath'),
    timeout: 10000
  });
  // Add bearer token
  atsAxios.interceptors.request.use(async (config) => {
    const token = await getToken();
    const auth = token ? `Bearer ${token}` : '';
    config.headers['Authorization'] = auth;
    return config;
  });
  return atsAxios;
}

const service = {
  /**
   * @function searchATSUsers
   * Searches for ATS users
   * @param {ATSUserSearchParameters} data The search parameters
   * @returns {Promise<data | null>} The result of calling the search api
   */
  searchATSUsers: async (params?: ATSUserSearchParameters) => {
    try {
      const { data, status } = await atsAxios().get('/clients', { params: params });
      return { data: data, status };
    } catch (e) {
      if (axios.isAxiosError(e)) {
        return {
          data: e.response?.data.message,
          status: e.response ? e.response.status : 500
        };
      } else {
        return {
          data: 'Error',
          status: 500
        };
      }
    }
  },

  /**
   * @function createATSClient
   * Creates a client in ATS
   * @param {ATSClientResource} data The client data
   * @returns {Promise<data | null>} The result of calling the post api
   */
  createATSClient: async (atsClient: ATSClientResource) => {
    try {
      const { data, status } = await atsAxios().post('/clients', atsClient);
      return { data: data, status };
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        return {
          data: e.response?.data.message,
          status: e.response ? e.response.status : 500
        };
      } else {
        return {
          data: 'Error',
          status: 500
        };
      }
    }
  },

  /**
   * @function createATSEnquiry
   * Creates a enquiry in ATS
   * @param {ATSEnquiryResource} data The client data
   * @returns {Promise<data | null>} The result of calling the post api
   */
  createATSEnquiry: async (atsEnquiry: ATSEnquiryResource) => {
    try {
      const { data, status } = await atsAxios().post('/enquiries', atsEnquiry);
      return { data: data, status };
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        return {
          data: e.response?.data.message,
          status: e.response ? e.response.status : 500
        };
      } else {
        return {
          data: 'Error',
          status: 500
        };
      }
    }
  }
};

export default service;

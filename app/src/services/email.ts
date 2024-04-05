import axios from 'axios';
import config from 'config';

import type { AxiosInstance } from 'axios';
import type { Email } from '../types';

/**
 * @function getToken
 * Gets Auth token using CHES client credentials
 * @returns
 */
async function getToken() {
  const response = await axios({
    method: 'POST',
    url: config.get('server.ches.tokenUrl'),
    data: {
      grant_type: 'client_credentials',
      client_id: config.get('server.ches.clientId'),
      client_secret: config.get('server.ches.clientSecret')
    },
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    withCredentials: true
  });
  return response.data.access_token;
}
/**
 * @function chesAxios
 * Returns an Axios instance with Authorization header
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
 */
function chesAxios(): AxiosInstance {
  // Create axios instance
  const chesAxios = axios.create({
    baseURL: config.get('server.ches.apiPath'),
    timeout: 10000
  });
  // Add bearer token
  chesAxios.interceptors.request.use(async (config) => {
    const token = await getToken();
    const auth = token ? `Bearer ${token}` : '';
    config.headers['Authorization'] = auth;
    return config;
  });
  return chesAxios;
}

const service = {
  /**
   * @function email
   * Sends an email with CHES service
   * @param emailData
   * @returns Axios response status and data
   */
  email: async (emailData: Email) => {
    try {
      const { data, status } = await chesAxios().post('/email', emailData, {
        headers: {
          'Content-Type': 'application/json'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      return { data, status };
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        return {
          data: e.response?.data.errors[0].message,
          status: e.response ? e.response.status : 500
        };
      } else {
        return {
          data: 'Email error',
          status: 500
        };
      }
    }
  },

  /**
   * @function health
   * Checks CHES service health
   * @returns Axios response status and data
   */
  health: async () => {
    const { data, status } = await chesAxios().get('/health');
    return { data, status };
  }
};

export default service;

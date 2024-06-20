import axios from 'axios';
import config from 'config';

import { AccessRole } from '../utils/enums/application';

import type { AxiosInstance } from 'axios';

/**
 * @function getToken
 * Gets Auth token using SSO credentials
 * @returns
 */
async function getToken() {
  const response = await axios({
    method: 'POST',
    url: config.get('server.sso.tokenUrl'),
    data: {
      grant_type: 'client_credentials',
      client_id: config.get('server.sso.clientId'),
      client_secret: config.get('server.sso.clientSecret')
    },
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    withCredentials: true
  });
  return response.data.access_token;
}

/**
 * @function ssoAxios
 * Returns an Axios instance with Authorization header
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
 */
function ssoAxios(): AxiosInstance {
  // Create axios instance
  const ssoAxios = axios.create({
    baseURL: config.get('server.sso.apiPath'),
    timeout: 10000
  });
  // Add bearer token
  ssoAxios.interceptors.request.use(async (config) => {
    const token = await getToken();
    const auth = token ? `Bearer ${token}` : '';
    config.headers['Authorization'] = auth;
    return config;
  });
  return ssoAxios;
}

const service = {
  requestBasicAccess: async (username: string) => {
    try {
      const integration = config.get('server.sso.integration');
      const { data, status } = await ssoAxios().post(`/integrations/${integration}/dev/users/${username}/roles`, [
        {
          name: AccessRole.PCNS_PROPONENT
        }
      ]);
      return { data: data.data, status };
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

  getRoles: async () => {
    try {
      const integration = config.get('server.sso.integration');
      const { data, status } = await ssoAxios().get(`/integrations/${integration}/dev/roles`);
      return { data: data.data, status };
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

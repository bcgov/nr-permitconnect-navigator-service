import axios from 'axios';
import config from 'config';
import { v4 as uuidv4 } from 'uuid';

import prisma from '../db/dataConnection';

import type { AxiosInstance } from 'axios';
import type { Email } from '../types';

type Message = {
  msgId: string;
  to: Array<string>;
};

type EmailData = {
  messages: Array<Message>;
  txId: string;
};
/**
 * Gets Auth token using CHES client credentials
 * @returns A valid access token
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
 * Returns an Axios instance with Authorization header
 * @returns An axios instance
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

/**
 * Sends an email with CHES service
 * @param emailData
 * @returns A Promise that resolves to the response from the external api
 */
export const email = async (emailData: Email) => {
  // Generate list of unique emails to be sent
  const uniqueEmails = Array.from(new Set([...emailData.to, ...(emailData?.cc || []), ...(emailData?.bcc || [])]));

  try {
    const { data, status } = await chesAxios().post('/email', emailData, {
      headers: {
        'Content-Type': 'application/json'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    logEmail(data, uniqueEmails, status);
    return { data, status };
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      logEmail(null, uniqueEmails, e.response ? e.response.status : 500);
      return {
        data: e.response?.data.errors[0].message,
        status: e.response ? e.response.status : 500
      };
    } else {
      logEmail(null, uniqueEmails, 500);
      return {
        data: 'Email error',
        status: 500
      };
    }
  }
};

/**
 * Logs CHES email api calls
 * @param data Object containing CHES response, or null on error
 * @param recipients Array of email strings
 * @param status Http status of CHES response
 * @returns The result of the transaction
 */
export const logEmail = async (data: EmailData | null, recipients: string[], status: number) => {
  return await prisma.$transaction(async (trx) => {
    return await trx.email_log.createMany({
      data: recipients.map((recipient) => ({
        emailLogId: uuidv4(),
        msgId: data?.messages?.[0].msgId,
        to: recipient,
        txId: data?.txId,
        httpStatus: status
      }))
    });
  });
};

/**
 * Checks CHES service health
 * @returns A Promise that resolves to the response from the external api
 */
export const health = async () => {
  const { data, status } = await chesAxios().get('/health');
  return { data, status };
};

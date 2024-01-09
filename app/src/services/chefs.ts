/* eslint-disable no-useless-catch */
import axios from 'axios';
import config from 'config';

import { getChefsApiKey, isTruthy } from '../components/utils';
import prisma from '../db/dataConnection';
import { submission } from '../db/models';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ChefsSubmissionForm, SubmissionSearchParameters } from '../types';

/**
 * @function chefsAxios
 * Returns an Axios instance for the CHEFS API
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
 */
function chefsAxios(formId: string, options: AxiosRequestConfig = {}): AxiosInstance {
  return axios.create({
    baseURL: config.get('server.chefs.apiPath'),
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

  getSubmission: async (formId: string, submissionId: string) => {
    try {
      // Check if record exists in our db
      const count = await prisma.submission.count({
        where: {
          submissionId: submissionId
        }
      });

      // Pull submission data from CHEFS and store to our DB if it doesn't exist
      if (!count) {
        const response = (await chefsAxios(formId).get(`submissions/${submissionId}`)).data;
        const status = (await chefsAxios(formId).get(`submissions/${submissionId}/status`)).data;

        const submission = response.submission.submission.data;

        const financiallySupportedValues = {
          financiallySupportedBC: isTruthy(submission.isBCHousingSupported),
          financiallySupportedIndigenous: isTruthy(submission.isIndigenousHousingProviderSupported),
          financiallySupportedNonProfit: isTruthy(submission.isNonProfitSupported),
          financiallySupportedHousingCoop: isTruthy(submission.isHousingCooperativeSupported)
        };

        await prisma.submission.create({
          data: {
            submissionId: response.submission.id,
            confirmationId: response.submission.confirmationId,
            contactEmail: submission.contactEmail,
            contactPhoneNumber: submission.contactPhoneNumber,
            contactName: `${submission.contactFirstName} ${submission.contactLastName}`,
            financiallySupported: Object.values(financiallySupportedValues).includes(true),
            ...financiallySupportedValues,
            intakeStatus: status[0].code,
            latitude: parseInt(submission.latitude),
            longitude: parseInt(submission.longitude),
            naturalDisaster: submission.naturalDisasterInd,
            projectName: submission.companyNameRegistered,
            queuePriority: parseInt(submission.queuePriority),
            singleFamilyUnits: submission.singleFamilyUnits ?? submission.multiFamilyUnits,
            streetAddress: submission.streetAddress,
            submittedAt: response.submission.createdAt,
            submittedBy: response.submission.createdBy
          }
        });
      }

      const result = await prisma.submission.findUnique({
        where: {
          submissionId: submissionId
        },
        include: {
          user: true
        }
      });

      return submission.fromPrismaModel(result);
    } catch (e: unknown) {
      throw e;
    }
  },

  getSubmissionStatus: async (formId: string, formSubmissionId: string) => {
    try {
      return (await chefsAxios(formId).get(`submissions/${formSubmissionId}/status`)).data;
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function searchSubmissions
   * Search and filter for specific submission
   * @param {string[]} [params.submissionId] Optional array of uuids representing the submission ID
   * @returns {Promise<object>} The result of running the findMany operation
   */
  searchSubmissions: async (params: SubmissionSearchParameters) => {
    const result = await prisma.submission.findMany({
      where: {
        OR: [
          {
            submissionId: { in: params.submissionId }
          }
        ]
      },
      include: {
        user: true
      }
    });

    return result.map((x) => submission.fromDBModel(x));
  },

  updateSubmission: async (data: ChefsSubmissionForm) => {
    try {
      await prisma.submission.update({
        data: submission.toPrismaModel(data),
        where: {
          submissionId: data.submissionId
        }
      });
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;

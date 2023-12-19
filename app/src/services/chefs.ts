/* eslint-disable no-useless-catch */
import axios from 'axios';
import config from 'config';

import { getChefsApiKey } from '../components/utils';
import prisma from '../db/dataConnection';
import { submission } from '../db/models';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ChefsSubmissionForm } from '../types';

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

        await prisma.submission.create({
          data: {
            submissionId: response.submission.id,
            confirmationId: response.submission.confirmationId,
            contactEmail: response.submission.submission.data.contactEmail,
            contactPhoneNumber: response.submission.submission.data.contactPhoneNumber,
            contactFirstName: response.submission.submission.data.contactFirstName,
            contactLastName: response.submission.submission.data.contactLastName,
            intakeStatus: status[0].code,
            projectName: response.submission.submission.data.projectName,
            queuePriority: parseInt(response.submission.submission.data.queuePriority),
            singleFamilyUnits: response.submission.submission.data.singleFamilyUnits,
            streetAddress: response.submission.submission.data.streetAddress,
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

      return result ? submission.toLogicalModel(result) : undefined;
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

  updateSubmission: async (data: ChefsSubmissionForm) => {
    try {
      await prisma.submission.update({
        data: submission.toPhysicalModel(data),
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

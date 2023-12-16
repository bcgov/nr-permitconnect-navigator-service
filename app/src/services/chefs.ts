/* eslint-disable no-useless-catch */
import axios from 'axios';
import config from 'config';
import { NIL } from 'uuid';

import { fromYrn, getChefsApiKey, toYrn } from '../components/utils';
import prisma from '../db/dataConnection';

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
      // Try to pull data from our DB
      let result = await prisma.submission.findUnique({
        where: {
          submissionId: submissionId
        }
      });

      // Pull submission data from CHEFS and store to our DB if it doesn't exist
      if (!result) {
        const response = (await chefsAxios(formId).get(`submissions/${submissionId}`)).data;
        const status = (await chefsAxios(formId).get(`submissions/${submissionId}/status`)).data;

        // TODO: Assigned to correct user
        result = await prisma.submission.create({
          data: {
            submissionId: response.submission.id,
            assignedToUserId: NIL, //status[0].assignedToUserId,
            confirmationId: response.submission.confirmationId,
            contactEmail: response.submission.submission.data.contactEmail,
            contactPhoneNumber: response.submission.submission.data.contactPhoneNumber,
            contactFirstName: response.submission.submission.data.contactFirstName,
            contactLastName: response.submission.submission.data.contactLastName,
            intakeStatus: status[0].code,
            projectName: response.submission.submission.data.projectName,
            queuePriority: response.submission.submission.data.queuePriority,
            singleFamilyUnits: response.submission.submission.data.singleFamilyUnits,
            streetAddress: response.submission.submission.data.streetAddress,
            atsClientNumber: null,
            addedToATS: null,
            financiallySupported: null,
            applicationStatus: null,
            relatedPermits: null,
            updatedAai: null,
            waitingOn: null,
            submittedAt: response.submission.createdAt,
            submittedBy: response.submission.createdBy,
            bringForwardDate: null,
            notes: null
          }
        });
      }

      return {
        ...result,
        addedToATS: toYrn(result.addedToATS),
        financiallySupported: toYrn(result.financiallySupported),
        updatedAai: toYrn(result.updatedAai)
      };
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
  },

  updateSubmission: async (data: ChefsSubmissionForm) => {
    try {
      await prisma.submission.update({
        data: {
          ...data,
          addedToATS: fromYrn(data.addedToATS),
          financiallySupported: fromYrn(data.financiallySupported),
          updatedAai: fromYrn(data.updatedAai)
        },
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

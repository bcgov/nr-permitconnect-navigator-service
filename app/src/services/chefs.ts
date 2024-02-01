/* eslint-disable no-useless-catch */
import axios from 'axios';
import config from 'config';

import { APPLICATION_STATUS_LIST } from '../components/constants';
import { getChefsApiKey, isTruthy } from '../components/utils';
import prisma from '../db/dataConnection';
import { submission } from '../db/models';
import { v4 as uuidv4 } from 'uuid';

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
  /**
   * @function getSubmission
   * Gets a full data export for the requested CHEFS form
   * @param {string} [formId] CHEFS form id
   * @returns {Promise<object>} The result of running the get operation
   */
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

  /**
   * @function getSubmission
   * Gets a specific submission from the PCNS database
   * The record will be pulled from CHEFS and created if it does not first exist
   * @param {string} [formId] CHEFS form id
   * @param {string} [formSubmissionId] CHEFS form submission id
   * @returns {Promise<object>} The result of running the findUnique operation
   */
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

        // Get greatest of multiple Units data
        const unitTypes = [submission.singleFamilyUnits, submission.multiFamilyUnits, submission.multiFamilyUnits1];
        const maxUnits = unitTypes.reduce(
          (ac, value) => {
            // Get max integer from value (eg: '1-49' returns 49)
            const upperRange: number = value ? parseInt(value.toString().replace(/(.*)-/, '').trim()) : 0;
            // Compare with accumulator
            return upperRange > ac.upperRange ? { value: value, upperRange: upperRange } : ac;
          },
          { upperRange: 0 } // Initial value
        ).value;

        // Create submission
        await prisma.submission.create({
          data: {
            submissionId: response.submission.id,
            applicationStatus: APPLICATION_STATUS_LIST.NEW,
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
            singleFamilyUnits: maxUnits,
            streetAddress: submission.streetAddress,
            submittedAt: response.submission.createdAt,
            submittedBy: response.submission.createdBy
          }
        });

        // Mapping of SHAS intake permit names to PCNS types
        const shasPermitMapping = new Map<string, string>([
          ['archaeologySiteAlterationPermit', 'Alteration'],
          ['archaeologyHeritageInspectionPermit', 'Inspection'],
          ['archaeologyInvestigationPermit', 'Investigation'],
          ['forestsPrivateTimberMark', 'Private Timber Mark'],
          ['forestsOccupantLicenceToCut', 'Occupant Licence To Cut'],
          ['landsCrownLandTenure', 'Commercial General'],
          ['roadwaysHighwayUsePermit', 'Highway Use Permit'],
          ['siteRemediation', 'Contaminated Sites Remediation'],
          ['subdividingLandOutsideAMunicipality', 'Rural Subdivision'],
          ['waterChangeApprovalForWorkInAndAboutAStream', 'Change Approval for Work in and About a Stream'],
          ['waterLicence', 'Water Licence'],
          ['waterNotificationOfAuthorizedChangesInAndAboutAStream', 'Notification'],
          ['waterShortTermUseApproval', 'Use Approval'],
          ['waterRiparianAreasProtection', 'New'],
          ['waterRiparianAreasProtection', 'New']
        ]);

        // Create Permits defined in SHAS intake form
        const permitTypes = await prisma.permit_type.findMany();
        const c = submission.permitGrid
          .map((x: { previousPermitType: string; previousTrackingNumber2: string }) => {
            const permit = permitTypes.find((y) => y.type === shasPermitMapping.get(x.previousPermitType));
            if (permit) {
              return {
                permitId: uuidv4(),
                permitTypeId: permit.permitTypeId,
                submissionId: response.submission.id,
                trackingId: x.previousTrackingNumber2
              };
            }
          })
          .filter((x: unknown) => !!x);

        await prisma.permit.createMany({
          data: c
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

  /**
   * @function getSubmissionStatus
   * Gets a specific submission status from CHEFS
   * @param {string} [formId] CHEFS form id
   * @param {string} [formSubmissionId] CHEFS form submission id
   * @returns {Promise<object>} The result of running the get operation
   */
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

    return result.map((x) => submission.fromPrismaModel(x));
  },

  /**
   * @function updateSubmission
   * Updates a specific submission
   * @param {ChefsSubmissionForm} [params.data] Submission to update
   * @returns {Promise<object>}
   */
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

/* eslint-disable no-useless-catch */
import axios from 'axios';
import config from 'config';
import { v4 as uuidv4 } from 'uuid';

import { APPLICATION_STATUS_LIST } from '../components/constants';
import { getChefsApiKey, isTruthy } from '../components/utils';
import prisma from '../db/dataConnection';
import { submission } from '../db/models';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { Submission, SubmissionSearchParameters } from '../types';

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
   * @function getStatistics
   * Gets a set of submission related statistics
   * @returns {Promise<object>} The result of running the query
   */
  getStatistics: async (filters: { dateFrom: string; dateTo: string; monthYear: string; userId: string }) => {
    // Return a single quoted string or null for the given value
    const val = (value: unknown) => (value ? `'${value}'` : null);

    const date_from = val(filters.dateFrom);
    const date_to = val(filters.dateTo);
    const month_year = val(filters.monthYear);
    const user_id = filters.userId?.length ? filters.userId : null;

    /* eslint-disable max-len */
    const response =
      await prisma.$queryRaw`select * from get_activity_statistics(${date_from}, ${date_to}, ${month_year}, ${user_id}::uuid)`;
    /* eslint-enable max-len */

    // count() returns BigInt
    // JSON.stringify() doesn't know how to serialize BigInt
    // https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-521460510
    return JSON.parse(JSON.stringify(response, (_key, value) => (typeof value === 'bigint' ? Number(value) : value)));
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
          submission_id: submissionId
        }
      });

      // Pull submission data from CHEFS and store to our DB if it doesn't exist
      if (!count) {
        const response = (await chefsAxios(formId).get(`submissions/${submissionId}`)).data;
        const status = (await chefsAxios(formId).get(`submissions/${submissionId}/status`)).data;

        const submission = response.submission.submission.data;

        const financiallySupportedValues = {
          financially_supported_bc: isTruthy(submission.isBCHousingSupported),
          financially_supported_indigenous: isTruthy(submission.isIndigenousHousingProviderSupported),
          financially_supported_non_profit: isTruthy(submission.isNonProfitSupported),
          financially_supported_housing_coop: isTruthy(submission.isHousingCooperativeSupported)
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
            submission_id: response.submission.id,
            application_status: APPLICATION_STATUS_LIST.NEW,
            activity_id: response.submission.confirmationId,
            company_name_registered: submission.companyNameRegistered,
            contact_email: submission.contactEmail,
            contact_phone_number: submission.contactPhoneNumber,
            contact_name: `${submission.contactFirstName} ${submission.contactLastName}`,
            financially_supported: Object.values(financiallySupportedValues).includes(true),
            ...financiallySupportedValues,
            // Convert uppercase code to title case
            intake_status: status[0].code.charAt(0).toUpperCase() + status[0].code.substr(1).toLowerCase(),
            latitude: parseInt(submission.latitude),
            longitude: parseInt(submission.longitude),
            natural_disaster: submission.naturalDisasterInd,
            project_name: submission.projectName,
            queue_priority: parseInt(submission.queuePriority),
            single_family_units: maxUnits,
            street_address: submission.streetAddress,
            submitted_at: response.submission.createdAt,
            submitted_by: response.submission.createdBy
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

        // Attempt to create Permits defined in SHAS intake form
        // permitGrid/previousTrackingNumber2 is current intake version as of 2024-02-01
        // dataGrid/previousTrackingNumber is previous intake version
        // not attempting to go back further than that
        const permitTypes = await prisma.permit_type.findMany();
        const permitGrid = submission.permitGrid ?? submission.dataGrid ?? null;
        if (permitGrid) {
          const c = permitGrid
            .map(
              (x: { previousPermitType: string; previousTrackingNumber2: string; previousTrackingNumber: string }) => {
                const permit = permitTypes.find((y) => y.type === shasPermitMapping.get(x.previousPermitType));
                if (permit) {
                  return {
                    permit_id: uuidv4(),
                    permit_type_id: permit.permit_type_id,
                    submission_id: response.submission.id,
                    tracking_id: x.previousTrackingNumber2 ?? x.previousTrackingNumber
                  };
                }
              }
            )
            .filter((x: unknown) => !!x);

          await prisma.permit.createMany({
            data: c
          });
        }
      }

      const result = await prisma.submission.findUnique({
        where: {
          submission_id: submissionId
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
            submission_id: { in: params.submissionId }
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
   * @param {Submission} [params.data] Submission to update
   * @returns {Promise<object>}
   */
  updateSubmission: async (data: Submission) => {
    try {
      await prisma.submission.update({
        data: { ...submission.toPrismaModel(data), updated_by: data.updatedBy },
        where: {
          submission_id: data.submissionId
        }
      });
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;
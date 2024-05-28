/* eslint-disable no-useless-catch */
import axios from 'axios';
import config from 'config';

import { APPLICATION_STATUS_LIST, Initiatives } from '../components/constants';
import { getChefsApiKey } from '../components/utils';
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
   * @function createSubmission
   * Creates a new submission
   * @returns {Promise<Partial<Submission>>} The result of running the transaction
   */
  createSubmission: async (data: Partial<Submission>) => {
    const response = await prisma.submission.create({
      data: submission.toPrismaModel(data as Submission)
    });

    return submission.fromPrismaModel(response);
  },

  /**
   * @function createSubmissionsFromExport
   * Creates the given activities and submissions from exported CHEFS data
   * @param {Array<Partial<Submission>>} submissions Array of Submissions
   * @returns {Promise<void>} The result of running the transaction
   */
  createSubmissionsFromExport: async (submissions: Array<Partial<Submission>>) => {
    await prisma.$transaction(async (trx) => {
      const initiative = await trx.initiative.findFirstOrThrow({
        where: {
          code: Initiatives.HOUSING
        }
      });

      await trx.activity.createMany({
        data: submissions.map((x) => ({
          activity_id: x.activityId as string,
          initiative_id: initiative.initiative_id
        }))
      });

      await trx.submission.createMany({
        data: submissions.map((x) => ({
          submission_id: x.submissionId as string,
          activity_id: x.activityId as string,
          application_status: APPLICATION_STATUS_LIST.NEW,
          company_name_registered: x.companyNameRegistered,
          contact_email: x.contactEmail,
          contact_phone_number: x.contactPhoneNumber,
          contact_name: x.contactName,
          contact_preference: x.contactPreference,
          contact_applicant_relationship: x.contactApplicantRelationship,
          financially_supported: x.financiallySupported,
          financially_supported_bc: x.financiallySupportedBC,
          financially_supported_indigenous: x.financiallySupportedIndigenous,
          financially_supported_non_profit: x.financiallySupportedNonProfit,
          financially_supported_housing_coop: x.financiallySupportedHousingCoop,
          intake_status: x.intakeStatus,
          location_pids: x.locationPIDs,
          latitude: parseFloat(x.latitude as unknown as string),
          longitude: parseFloat(x.longitude as unknown as string),
          natural_disaster: x.naturalDisaster,
          project_name: x.projectName,
          project_description: x.projectDescription,
          queue_priority: x.queuePriority,
          single_family_units: x.singleFamilyUnits,
          has_rental_units: x.hasRentalUnits,
          street_address: x.streetAddress,
          submitted_at: new Date(x.submittedAt ?? Date.now()),
          submitted_by: x.submittedBy as string
        }))
      });
    });
  },

  /**
   * @function deleteSubmission
   * Deletes the submission, followed by the associated activity
   * This action will cascade delete across all linked items
   * @param {string} submissionId Submission ID
   * @returns {Promise<Submission>} The result of running the delete operation
   */
  deleteSubmission: async (submissionId: string) => {
    const response = await prisma.$transaction(async (trx) => {
      const del = await trx.submission.delete({
        where: {
          submission_id: submissionId
        }
      });

      await trx.activity.delete({
        where: {
          activity_id: del.activity_id
        }
      });

      return del;
    });

    return submission.fromPrismaModel(response);
  },

  /**
   * @function getSubmission
   * Gets a full data export for the requested CHEFS form
   * @param {string} formId CHEFS form id
   * @returns {Promise<any>} The result of running the get operation
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
   * @param {string} activityId PCNS Activity ID
   * @returns {Promise<Submission | null>} The result of running the findFirst operation
   */
  getSubmission: async (submissionId: string) => {
    try {
      const result = await prisma.submission.findFirst({
        where: {
          submission_id: submissionId
        }
      });

      return result ? submission.fromPrismaModel(result) : null;
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function getSubmissions
   * Gets a list of submissions
   * @returns {Promise<(Submission | null)[]>} The result of running the findMany operation
   */
  getSubmissions: async () => {
    try {
      const result = await prisma.submission.findMany({ include: { user: true } });

      return result.map((x) => submission.fromPrismaModelWithUser(x));
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function searchSubmissions
   * Search and filter for specific submission
   * @param {string[]} [params.activityId] Optional array of uuids representing the activity ID
   * @param {string[]} [params.submissionId] Optional array of uuids representing the submission ID
   * @returns {Promise<(Submission | null)[]>} The result of running the findMany operation
   */
  searchSubmissions: async (params: SubmissionSearchParameters) => {
    const result = await prisma.submission.findMany({
      where: {
        OR: [
          {
            activity_id: { in: params.activityId }
          },
          {
            submission_id: { in: params.submissionId }
          }
        ]
      }
    });

    return result.map((x) => submission.fromPrismaModel(x));
  },

  /**
   * @function updateSubmission
   * Updates a specific submission
   * @param {Submission} data Submission to update
   * @returns {Promise<Submission | null>} The result of running the update operation
   */
  updateSubmission: async (data: Submission) => {
    try {
      const result = await prisma.submission.update({
        data: { ...submission.toPrismaModel(data), updated_by: data.updatedBy },
        where: {
          submission_id: data.submissionId
        }
      });

      return submission.fromPrismaModel(result);
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;

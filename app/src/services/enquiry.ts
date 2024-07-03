/* eslint-disable no-useless-catch */
import prisma from '../db/dataConnection';
import { enquiry } from '../db/models';

import type { Enquiry, EnquirySearchParameters } from '../types';

const service = {
  /**
   * @function createEnquiry
   * Creates a new enquiry
   * @returns {Promise<Partial<Enquiry>>} The result of running the transaction
   */
  createEnquiry: async (data: Partial<Enquiry>) => {
    const response = await prisma.enquiry.create({
      data: enquiry.toPrismaModel(data as Enquiry)
    });

    return enquiry.fromPrismaModel(response);
  },

  /**
   * @function deleteEnquiry
   * Deletes the enquiry, followed by the associated activity
   * This action will cascade delete across all linked items
   * @param {string} enquiryId Enquiry ID
   * @returns {Promise<Enquiry>} The result of running the delete operation
   */
  deleteEnquiry: async (enquiryId: string) => {
    const response = await prisma.$transaction(async (trx) => {
      const del = await trx.enquiry.delete({
        where: {
          enquiry_id: enquiryId
        }
      });

      await trx.activity.delete({
        where: {
          activity_id: del.activity_id
        }
      });

      return del;
    });

    return enquiry.fromPrismaModel(response);
  },

  /**
   * @function getEnquiries
   * Gets a list of enquiries
   * @returns {Promise<(Enquiry | null)[]>} The result of running the findMany operation
   */
  getEnquiries: async () => {
    try {
      // fetch all enquiries with activity not deleted
      const result = await prisma.enquiry.findMany({
        where: {
          activity: {
            is_deleted: false
          }
        },
        include: {
          user: true
        }
      });

      return result.map((x) => enquiry.fromPrismaModelWithUser(x));
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function getEnquiry
   * Gets a specific enquiry from the PCNS database
   * @param {string} enquiryId Enquiry ID
   * @returns {Promise<Enquiry | null>} The result of running the findFirst operation
   */
  getEnquiry: async (enquiryId: string) => {
    try {
      const result = await prisma.enquiry.findFirst({
        where: {
          enquiry_id: enquiryId
        }
      });

      return result ? enquiry.fromPrismaModel(result) : null;
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function searchEnquiries
   * Search and filter for specific submission
   * @param {string[]} [params.activityId] Optional array of uuids representing the activity ID
   * @param {string[]} [params.enquiry_id] Optional array of uuids representing the enquiry ID
   * @param {string[]} [params.intakeStatus] Optional array of strings representing the intake status
   * @param {boolean}  [params.includeUser] Optional boolean representing whether the linked user should be included
   * @returns {Promise<(Submission | null)[]>} The result of running the findMany operation
   */
  searchEnquiries: async (params: EnquirySearchParameters) => {
    try {
      const result = await prisma.enquiry.findMany({
        include: { user: params.includeUser },
        where: {
          AND: [
            {
              activity_id: { in: params.activityId }
            },
            {
              enquiry_id: { in: params.enquiryId }
            },
            {
              intake_status: { in: params.intakeStatus }
            }
          ]
        }
      });

      return result.map((x) => enquiry.fromPrismaModel(x));
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function getRelatedEnquiries
   * Gets list of enquiries related to the given activityId
   * @param {string} activityId Activity ID
   * @returns {Promise<Enquiry | null>} The result of running the findFirst operation
   */
  getRelatedEnquiries: async (activityId: string) => {
    try {
      const result = await prisma.enquiry.findMany({
        where: {
          related_activity_id: activityId
        },
        orderBy: {
          created_at: 'asc'
        }
      });

      return result.map((x) => enquiry.fromPrismaModel(x));
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function updateEnquiry
   * Updates a specific enquiry
   * @param {Enquiry} data Enquiry to update
   * @returns {Promise<Enquiry | null>} The result of running the update operation
   */
  updateEnquiry: async (data: Enquiry) => {
    try {
      const result = await prisma.enquiry.update({
        data: { ...enquiry.toPrismaModel(data), updated_by: data.updatedBy },
        where: {
          enquiry_id: data.enquiryId
        }
      });

      return enquiry.fromPrismaModel(result);
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function updateIsDeletedFlag
   * Updates is_deleted flag for the corresponding activity
   * @param {string} enquiryId Enquiry ID
   * @param {string} isDeleted flag
   * @returns {Promise<Enquiry>} The result of running the delete operation
   */
  updateIsDeletedFlag: async (enquiryId: string, isDeleted: boolean) => {
    const deleteEnquiry = await prisma.enquiry.findUnique({
      where: {
        enquiry_id: enquiryId
      }
    });
    if (deleteEnquiry) {
      await prisma.activity.update({
        data: { is_deleted: isDeleted },
        where: {
          activity_id: deleteEnquiry.activity_id
        }
      });
      return enquiry.fromPrismaModel(deleteEnquiry);
    }
  }
};

export default service;

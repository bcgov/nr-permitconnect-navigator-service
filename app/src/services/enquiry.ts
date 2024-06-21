/* eslint-disable no-useless-catch */
import prisma from '../db/dataConnection';
import { enquiry } from '../db/models';

import type { Enquiry } from '../types';

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
  deleteEnquiry: async (enquiryId: string, hardDelete: string) => {
    if (hardDelete) {
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
    } else {
      const deleteEnquiry = await prisma.enquiry.findUnique({
        where: {
          enquiry_id: enquiryId
        }
      });
      if (deleteEnquiry) {
        await prisma.activity.update({
          data: { is_deleted: true },
          where: {
            activity_id: deleteEnquiry?.activity_id
          }
        });
        return enquiry.fromPrismaModel(deleteEnquiry);
      }
    }
  },

  /**
   * @function getEnquiries
   * Gets a list of enquiries
   * @returns {Promise<(Enquiry | null)[]>} The result of running the findMany operation
   */
  getEnquiries: async () => {
    try {
      let result = await prisma.enquiry.findMany({ include: { user: true } });
      const softDeletedActivities = await prisma.activity.findMany({ where: { is_deleted: true } });
      // Remove soft deleted enquiries
      if (softDeletedActivities.length)
        result = result.filter((x) => !softDeletedActivities.some((y) => y.activity_id === x.activity_id));

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
  }
};

export default service;

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

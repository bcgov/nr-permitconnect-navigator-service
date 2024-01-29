/* eslint-disable no-useless-catch */

import prisma from '../db/dataConnection';
import { permit, permit_type } from '../db/models';
import { v4 as uuidv4 } from 'uuid';

import type { Permit } from '../types';

const service = {
  /**
   * @function createPermit
   * Creates a Permit
   * @returns {Promise<object>} The result of running the findUnique operation
   */
  createPermit: async (data: Permit) => {
    try {
      const newPermit = { ...data, permitId: uuidv4() };

      const create = await prisma.permit.create({
        include: {
          permit_type: true,
          submission: {
            include: { user: true }
          }
        },
        data: permit.toPrismaModel(newPermit)
      });

      return permit.fromPrismaModel(create);
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function deletePermit
   * Delete a permit
   * @param permitId Permit ID
   * @returns {Promise<object>} The result of running the delete operation
   */
  deletePermit: async (permitId: string) => {
    const response = await prisma.permit.delete({
      include: {
        permit_type: true,
        submission: {
          include: { user: true }
        }
      },
      where: {
        permitId: permitId
      }
    });

    return permit.fromPrismaModel(response);
  },

  /**
   * @function getPermitTypes
   * Get all Permit types
   * @returns {Promise<object>} The result of running the findMany operation
   */
  getPermitTypes: async () => {
    const result = await prisma.permit_type.findMany({
      orderBy: {
        permitTypeId: 'asc'
      }
    });
    return result.map((x) => permit_type.fromPrismaModel(x));
  },

  /**
   * @function listPermits
   * Retrieve a list of permits associated with a given submission
   * @param submissionId PCNS Submission ID
   * @returns {Promise<object>} Array of documents associated with the submission
   */
  listPermits: async (submissionId: string) => {
    const response = await prisma.permit.findMany({
      include: {
        permit_type: true,
        submission: {
          include: { user: true }
        }
      },
      where: {
        submissionId: submissionId
      },
      orderBy: {
        updatedAt: 'asc'
      }
    });

    return response.map((x) => permit.fromPrismaModel(x));
  },

  /**
   * @function updatePermit
   * Updates a Permit
   * @returns {Promise<object>} The result of running the update operation
   */
  updatePermit: async (data: Permit) => {
    try {
      await prisma.permit.update({
        data: permit.toPrismaModel(data),
        where: {
          permitId: data.permitId
        }
      });
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;
/* eslint-disable no-useless-catch */

import prisma from '../db/dataConnection';
import { permit, permit_type } from '../db/models';
import { v4 as uuidv4 } from 'uuid';

import type { Permit } from '../types';

const service = {
  /**
   * @function createPermit
   * Creates a Permit
   * @param {Permit} data Permit object
   * @returns {Promise<Permit | null>} The result of running the create operation
   */
  createPermit: async (data: Permit) => {
    try {
      const newPermit = { ...data, permitId: uuidv4() };

      const create = await prisma.permit.create({
        include: {
          permit_type: true
        },
        data: { ...permit.toPrismaModel(newPermit), updated_by: data.updatedBy }
      });
      return permit.fromPrismaModel(create);
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function deletePermit
   * Delete a permit
   * @param {string} permitId Permit ID
   * @returns {Promise<Permit | null>} The result of running the delete operation
   */
  deletePermit: async (permitId: string) => {
    const response = await prisma.permit.delete({
      include: {
        permit_type: true
      },
      where: {
        permit_id: permitId
      }
    });

    return permit.fromPrismaModel(response);
  },

  /**
   * @function getPermitTypes
   * Get all Permit types
   * @returns {Promise<PermitType[]>} The result of running the findMany operation
   */
  getPermitTypes: async () => {
    const result = await prisma.permit_type.findMany({
      orderBy: {
        permit_type_id: 'asc'
      }
    });
    return result.map((x) => permit_type.fromPrismaModel(x));
  },

  /**
   * @function listPermits
   * Retrieve a list of permits associated with a given activity
   * @param {string} activityId PCNS Activity ID
   * @returns {Promise<(Permit | null)[]>} The result of running the findMany operation
   */
  listPermits: async (activityId: string) => {
    const response = await prisma.permit.findMany({
      include: {
        permit_type: true
      },
      where: {
        activity_id: activityId
      },
      orderBy: {
        permit_type: {
          name: 'asc'
        }
      }
    });

    return response.map((x) => permit.fromPrismaModel(x));
  },

  /**
   * @function updatePermit
   * Updates a Permit
   * @param {Permit} data Permit object
   * @returns {Promise<Permit | null>} The result of running the update operation
   */
  updatePermit: async (data: Permit) => {
    try {
      const response = await prisma.permit.update({
        include: {
          permit_type: true
        },
        data: { ...permit.toPrismaModel(data), updated_by: data.updatedBy },
        where: {
          permit_id: data.permitId
        }
      });

      return permit.fromPrismaModel(response);
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;

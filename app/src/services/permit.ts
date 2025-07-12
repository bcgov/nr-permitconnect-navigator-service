import prisma from '../db/dataConnection';
import { v4 as uuidv4 } from 'uuid';

import { Initiative } from '../utils/enums/application';

import type { ListPermitsOptions, Permit, PermitType, PermitWithRelations, PermitWithType } from '../types';

const service = {
  /**
   * Create a Permit
   * @param data - The Permit object to create
   * @returns A Promise that resolves to the created resource
   */
  createPermit: async (data: Permit): Promise<PermitWithRelations> => {
    const newPermit = { ...data, permitId: uuidv4() };

    const create = await prisma.permit.create({
      include: {
        permitType: true,
        permitNote: true
      },
      data: newPermit
    });
    return create;
  },

  /**
   * Delete a permit
   * @param permitId - The ID of the Permit to delete
   * @returns A Promise that resolves to the deleted resource
   */
  deletePermit: async (permitId: string): Promise<PermitWithType> => {
    const response = await prisma.permit.delete({
      include: {
        permitType: true
      },
      where: {
        permitId
      }
    });

    return response;
  },

  /**
   * Delete permits associated to an activity
   * @param activityId - The ID of the activity to delete all permits from
   * @returns A Promise that resolves to the number of deleted resource
   */
  deletePermitsByActivity: async (activityId: string): Promise<number> => {
    const response = await prisma.permit.deleteMany({
      where: {
        activityId: activityId
      }
    });

    return response.count;
  },

  /**
   * Get a permit
   * @param permitId - The ID of the permit to retrieve
   * @returns A Promise that resolves to the permit for the given permitId
   */
  getPermit: async (permitId: string): Promise<PermitWithRelations> => {
    const result = await prisma.permit.findFirstOrThrow({
      where: {
        permitId: permitId
      },
      include: {
        permitType: true,
        permitNote: { orderBy: { createdAt: 'desc' } }
      }
    });

    return result;
  },

  /**
   * Retrieve all permits matching the search parameters
   * @param options - The search parameters
   * @returns A Promise that resolves to the permits matching the given options
   */
  listPermits: async (options?: ListPermitsOptions): Promise<PermitWithRelations[]> => {
    const response = await prisma.permit.findMany({
      include: {
        permitType: true,
        permitNote: options?.includeNotes ? { orderBy: { createdAt: 'desc' } } : false
      },
      where: {
        activityId: options?.activityId || undefined
      },
      orderBy: {
        permitType: {
          name: 'asc'
        }
      }
    });

    return response;
  },

  /**
   * Get all Permit types for the given initiative
   * @param initiative - The initiative for which the permit types belong to
   * @returns A Promise that resolves to the permit types for the given initiative
   */
  listPermitTypes: async (initiative: Initiative): Promise<PermitType[]> => {
    const initiativeResult = await prisma.initiative.findFirstOrThrow({
      include: {
        permitTypeInitiativeXref: {
          include: {
            permitType: true
          },
          orderBy: [
            {
              permitType: {
                businessDomain: 'asc'
              }
            },
            {
              permitType: {
                name: 'asc'
              }
            }
          ]
        }
      },
      where: {
        code: initiative
      }
    });

    return initiativeResult.permitTypeInitiativeXref.map((y) => y.permitType);
  },

  /**
   * Update a Permit
   * @param data - The Permit object to update
   * @returns A Promise that resolves to the updated resource
   */
  updatePermit: async (data: Permit): Promise<PermitWithType> => {
    const response = await prisma.permit.update({
      include: {
        permitType: true
      },
      data: data,
      where: {
        permitId: data.permitId
      }
    });

    return response;
  }
};

export default service;

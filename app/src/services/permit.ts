import prisma from '../db/dataConnection';
import { v4 as uuidv4 } from 'uuid';

import { Initiative } from '../utils/enums/application';

import type { ListPermitsOptions, Permit, PermitBase, PermitType } from '../types';

/**
 * Create a permit
 * @param data - The permit object to create
 * @returns A Promise that resolves to the created resource
 */
export const createPermit = async (data: PermitBase): Promise<Permit> => {
  const newPermit = { ...data, permitId: uuidv4() };

  const create = await prisma.permit.create({
    include: {
      permitType: true
    },
    data: newPermit
  });

  return create;
};

/**
 * Delete a permit
 * @param permitId - The ID of the permit to delete
 * @returns A Promise that resolves to the deleted resource
 */
export const deletePermit = async (permitId: string): Promise<Permit> => {
  const response = await prisma.permit.delete({
    include: {
      permitNote: true,
      permitType: true
    },
    where: {
      permitId
    }
  });

  return response;
};

/**
 * Delete permits associated to an activity
 * @param activityId - The ID of the activity to delete all permits from
 * @returns A Promise that resolves to the number of deleted resource
 */
export const deletePermitsByActivity = async (activityId: string): Promise<number> => {
  const response = await prisma.permit.deleteMany({
    where: {
      activityId: activityId
    }
  });

  return response.count;
};

/**
 * Get a permit
 * @param permitId - The ID of the permit to retrieve
 * @returns A Promise that resolves to the permit for the given permitId
 */
export const getPermit = async (permitId: string): Promise<Permit> => {
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
};

/**
 * Retrieve all permits matching the search parameters
 * @param options - The search parameters
 * @returns A Promise that resolves to the permits matching the given options
 */
export const listPermits = async (options?: ListPermitsOptions): Promise<Permit[]> => {
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
};

/**
 * Get all Permit types for the given initiative
 * @param initiative - The initiative for which the permit types belong to
 * @returns A Promise that resolves to the permit types for the given initiative
 */
export const listPermitTypes = async (initiative: Initiative): Promise<PermitType[]> => {
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
};

/**
 * Update a permit
 * @param data - The permit object to update
 * @returns A Promise that resolves to the updated resource
 */
export const updatePermit = async (data: PermitBase): Promise<Permit> => {
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
};

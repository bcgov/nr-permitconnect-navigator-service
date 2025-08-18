import { Initiative } from '../utils/enums/application';

import type { PrismaTransactionClient } from '../db/dataConnection';
import type { ListPermitsOptions, Permit, PermitBase, PermitType } from '../types';

/** Delete a specific permit
 * @param tx Prisma transaction client
 * @param permitId Permit ID
 */
export const deletePermit = async (tx: PrismaTransactionClient, permitId: string): Promise<void> => {
  await tx.permit.delete({
    include: {
      permitType: true
    },
    where: {
      permitId: permitId
    }
  });
};

/**
 * Delete a permit
 * @param tx Prisma transaction client
 * @param activityId Activity ID to remove permits from
 * @returns The result of running the deleteMany operation
 */
export const deletePermitsByActivity = async (tx: PrismaTransactionClient, activityId: string): Promise<number> => {
  const response = await tx.permit.deleteMany({
    where: {
      activityId: activityId
    }
  });

  return response.count;
};

/**
 * Gets a specific permit
 * @param tx Prisma transaction client
 * @param permitId Permit ID
 * @returns A Promise that resolves to the specific permit
 */
export const getPermit = async (tx: PrismaTransactionClient, permitId: string): Promise<Permit> => {
  const result = await tx.permit.findFirstOrThrow({
    where: {
      permitId: permitId
    },
    include: {
      permitType: true,
      permitNote: { orderBy: { createdAt: 'desc' } },
      permitTracking: { include: { sourceSystemKind: true } }
    }
  });

  return result;
};

/**
 * Gets all Permit types for the given initiative
 * @param tx Prisma transaction client
 * @param initiative Initiative code
 * @returns A Promise that resolves to an array of permit types for a certain initiative
 */
export const getPermitTypes = async (tx: PrismaTransactionClient, initiative: Initiative): Promise<PermitType[]> => {
  const initiativeResult = await tx.initiative.findFirstOrThrow({
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
 * Retrieve all permits if no activityId is provided, otherwise retrieve permits for a specific activity
 * @param tx Prisma transaction client
 * @param options.activityId Optional PCNS Activity ID
 * @param options.includeNotes Optional flag to include permit notes
 * @returns A Promise that resolves to an array of permits
 */
export const listPermits = async (tx: PrismaTransactionClient, options?: ListPermitsOptions): Promise<Permit[]> => {
  const response = await tx.permit.findMany({
    include: {
      permitType: true,
      permitNote: options?.includeNotes ? { orderBy: { createdAt: 'desc' } } : false,
      permitTracking: {
        include: {
          sourceSystemKind: true
        }
      }
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
 * Upsert a Permit
 * @param tx Prisma transaction client
 * @param data Permit object
 * @returns A Promise that resolves to the upserted permit
 */
export const upsertPermit = async (tx: PrismaTransactionClient, data: PermitBase): Promise<Permit> => {
  const response = await tx.permit.upsert({
    include: {
      permitType: true
    },
    where: {
      permitId: data.permitId
    },
    update: { ...data, updatedBy: data.updatedBy },
    create: {
      ...data,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy
    }
  });

  return response;
};

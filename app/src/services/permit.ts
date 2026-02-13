import { Initiative } from '../utils/enums/application.ts';

import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { ListPermitsOptions, Permit, PermitBase, PermitSearchParams, PermitType } from '../types/index.ts';

/**
 * Delete a specific permit
 * @param tx Prisma transaction client
 * @param permitId Permit ID
 */
export const deletePermit = async (tx: PrismaTransactionClient, permitId: string): Promise<void> => {
  await tx.permit.delete({
    where: {
      permitId: permitId
    },
    include: {
      permitType: true
    }
  });
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
    where: {
      code: initiative
    },
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
    }
  });

  return initiativeResult.permitTypeInitiativeXref.map((y) => y.permitType);
};

/**
 * Retrieve all permits if no activityId is provided, otherwise retrieve permits for a specific activity
 * @param tx Prisma transaction client
 * @param options Optional filtering parameters
 * @param options.activityId Optional PCNS Activity ID
 * @param options.includeNotes Optional flag to include permit notes
 * @returns A Promise that resolves to an array of permits
 */
export const listPermits = async (tx: PrismaTransactionClient, options?: ListPermitsOptions): Promise<Permit[]> => {
  const response = await tx.permit.findMany({
    where: {
      activityId: options?.activityId ?? undefined
    },
    orderBy: {
      permitType: {
        name: 'asc'
      }
    },
    include: {
      permitType: true,
      permitNote: options?.includeNotes ? { orderBy: { createdAt: 'desc' } } : false,
      permitTracking: {
        include: {
          sourceSystemKind: true
        }
      }
    }
  });

  return response;
};

/**
 * Retrieve permits matching the given params
 * @param tx Prisma transaction client
 * @param params Search params
 * @returns A Promise that resolves to a list of permits matching the search params
 */
export const searchPermits = async (tx: PrismaTransactionClient, params: PermitSearchParams): Promise<Permit[]> => {
  let permitTrackingInclude: object = {};
  const {
    permitId,
    activityId,
    permitTypeId,
    stage,
    state,
    sourceSystems,
    includePermitNotes,
    includePermitTracking,
    includePermitType,
    onlyPeachIntegratedTrackings
  } = params;

  // Build permitTracking filter/include
  if (includePermitTracking) {
    const sourceSystemAndClause = sourceSystems ? { sourceSystemKind: { sourceSystem: { in: sourceSystems } } } : {};
    const peachIntegratedAndClause = onlyPeachIntegratedTrackings ? { sourceSystemKind: { integrated: true } } : {};
    const permitTrackingWhere =
      sourceSystems || onlyPeachIntegratedTrackings
        ? { AND: [sourceSystemAndClause, peachIntegratedAndClause] }
        : undefined;

    permitTrackingInclude = {
      permitTracking: {
        ...(permitTrackingWhere ? { where: permitTrackingWhere } : {}),
        include: { sourceSystemKind: true }
      }
    };
  }

  const response = await tx.permit.findMany({
    where: {
      AND: [
        permitId ? { permitId: { in: permitId } } : {},
        activityId ? { activityId: { in: activityId } } : {},
        permitTypeId ? { permitTypeId: { in: permitTypeId } } : {},
        stage ? { stage: { in: stage } } : {},
        state ? { state: { in: state } } : {},
        sourceSystems ? { permitType: { sourceSystem: { in: sourceSystems } } } : {},
        onlyPeachIntegratedTrackings ? { permitTracking: { some: { sourceSystemKind: { integrated: true } } } } : {}
      ]
    },
    include: {
      ...(includePermitType ? { permitType: true } : {}),
      ...(includePermitNotes ? { permitNote: true } : {}),
      ...permitTrackingInclude
    }
  });
  return response;
};

/**
 * Upsert a Permit
 * @param tx Prisma transaction client
 * @param data Permit object
 * @returns A Promise that resolves to the created/updated permit
 */
export const upsertPermit = async (tx: PrismaTransactionClient, data: PermitBase): Promise<Permit> => {
  const response = await tx.permit.upsert({
    update: data,
    create: data,
    where: {
      permitId: data.permitId
    },
    include: {
      permitType: true,
      permitNote: { orderBy: { createdAt: 'desc' } }
    }
  });

  return response;
};

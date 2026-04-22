import { Initiative } from '../utils/enums/application.ts';

import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type {
  ListPermitsOptions,
  Permit,
  PermitBase,
  PermitSearchParams,
  PermitType,
  SearchPermitsOptions
} from '../types/index.ts';

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
 * Search and retrieve permits with pagination, filtering, and sorting
 * @param tx Prisma transaction client
 * @param initiative Initiative code (excludes PCNS)
 * @param options Search and filter options
 * @returns A Promise that resolves to an object with permits array and total count
 */
export const searchPermitsPaginated = async (
  tx: PrismaTransactionClient,
  initiative: Exclude<Initiative, Initiative.PCNS>,
  options: SearchPermitsOptions
): Promise<{ permits: Permit[]; totalRecords: number }> => {
  // Determine project table based on initiative, exclude PCNS
  const projectTableMap: Record<Exclude<Initiative, Initiative.PCNS>, string> = {
    [Initiative.ELECTRIFICATION]: 'electrificationProject',
    [Initiative.GENERAL]: 'generalProject',
    [Initiative.HOUSING]: 'housingProject'
  };

  const projectTable = projectTableMap[initiative];

  const validSortFields = ['decisionDate', 'stage', 'state', 'statusLastChanged', 'submittedDate'];

  let orderBy: Record<string, 'asc' | 'desc'> | undefined;

  if (options?.sortOrder !== '0' && options?.sortField && validSortFields.includes(options.sortField)) {
    const sortDirection = options.sortOrder === '1' ? 'asc' : 'desc';
    orderBy = { [options.sortField]: sortDirection };
  }

  const whereClause = {
    AND: [
      {
        activity: {
          [projectTable]: {
            some: {}
          }
        }
      },
      options.dateRange
        ? {
            OR: [
              { submittedDate: { gte: options.dateRange[0], lte: options.dateRange[1] } },
              { decisionDate: { gte: options.dateRange[0], lte: options.dateRange[1] } },
              { statusLastChanged: { gte: options.dateRange[0], lte: options.dateRange[1] } }
            ]
          }
        : {},
      options?.permitTypeId ? { permitTypeId: Number.parseInt(options.permitTypeId) } : {},
      options?.sourceSystemKindId
        ? {
            permitTracking: {
              some: {
                sourceSystemKindId: Number.parseInt(options.sourceSystemKindId)
              }
            }
          }
        : {},
      options?.searchTag
        ? {
            OR: [
              { activityId: { contains: options.searchTag, mode: 'insensitive' as const } },
              { stage: { contains: options.searchTag, mode: 'insensitive' as const } },
              { state: { contains: options.searchTag, mode: 'insensitive' as const } },
              { permitType: { name: { contains: options.searchTag, mode: 'insensitive' as const } } },
              { permitType: { businessDomain: { contains: options.searchTag, mode: 'insensitive' as const } } },
              {
                activity: {
                  [projectTable]: {
                    some: {
                      OR: [
                        { projectName: { contains: options.searchTag, mode: 'insensitive' as const } },
                        { companyNameRegistered: { contains: options.searchTag, mode: 'insensitive' as const } },
                        // Only include location fields for initiatives that have them (not ELECTRIFICATION)
                        ...(initiative === Initiative.ELECTRIFICATION
                          ? []
                          : [
                              { streetAddress: { contains: options.searchTag, mode: 'insensitive' as const } },
                              { locality: { contains: options.searchTag, mode: 'insensitive' as const } },
                              { province: { contains: options.searchTag, mode: 'insensitive' as const } }
                            ])
                      ]
                    }
                  }
                }
              },
              {
                permitTracking: {
                  some: {
                    trackingId: { contains: options.searchTag, mode: 'insensitive' as const }
                  }
                }
              }
            ]
          }
        : {}
    ]
  };

  // Get total count (without pagination)
  const totalRecords = await tx.permit.count({
    where: whereClause
  });

  // Get paginated data
  const permits = await tx.permit.findMany({
    skip: options?.skip ? Number.parseInt(options.skip) : 0,
    take: options?.take ? Number.parseInt(options.take) : 10,
    where: whereClause,
    orderBy: orderBy,
    include: {
      permitType: true,
      permitTracking: {
        include: {
          sourceSystemKind: true
        }
      },
      activity: {
        include: {
          [projectTable]: true
        }
      }
    }
  });

  // Map the results to alias the project table as 'project'
  const permitsWithProjectAlias = permits.map((permit) => {
    const { [projectTable]: projectData, ...activityData } = permit.activity;

    return {
      ...permit,
      activity: {
        ...activityData,
        project: projectData
      }
    };
  });

  return { permits: permitsWithProjectAlias, totalRecords };
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

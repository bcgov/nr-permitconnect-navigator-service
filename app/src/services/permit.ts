import { Initiative } from '../utils/enums/application.ts';

import type { PrismaTransactionClient } from '../db/database.ts';
import type {
  ListPermitsOptions,
  Permit,
  PermitBase,
  SearchPermitsOptions,
  SearchPermitsResponse
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
      activity: {
        include: {
          activityContact: true
        }
      },
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
 * Retrieve permits and trackers that are PEACH integrated
 * @param tx Prisma transaction client
 * @returns A Promise that resolves to a list of permits matching the search params
 */
export const listPeachIntegratedTrackings = async (tx: PrismaTransactionClient): Promise<Permit[]> => {
  const response = await tx.permit.findMany({
    where: {
      AND: [{ permitTracking: { some: { sourceSystemKind: { integrated: true } } } }]
    },
    include: {
      permitTracking: {
        where: { AND: [{ sourceSystemKind: { integrated: true } }] },
        include: { sourceSystemKind: true }
      }
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
export const searchPermits = async (
  tx: PrismaTransactionClient,
  initiative: Exclude<Initiative, Initiative.PCNS>,
  options: SearchPermitsOptions
): Promise<SearchPermitsResponse> => {
  // Determine project table based on initiative, exclude PCNS
  const projectTableMap = {
    [Initiative.ELECTRIFICATION]: 'electrificationProject',
    [Initiative.GENERAL]: 'generalProject',
    [Initiative.HOUSING]: 'housingProject'
  } as const;

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
          [projectTable]: { isNot: null }
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
    select: {
      permitId: true,
      activityId: true,
      permitTypeId: true,
      decisionDate: true,
      stage: true,
      state: true,
      statusLastChanged: true,
      submittedDate: true,
      permitType: {
        select: {
          businessDomain: true,
          name: true
        }
      },
      activity: {
        select: {
          electrificationProject: {
            select: {
              projectId: true,
              projectName: true,
              companyNameRegistered: true
            }
          },
          generalProject: {
            select: {
              projectId: true,
              projectName: true,
              companyNameRegistered: true,
              streetAddress: true,
              locality: true,
              province: true
            }
          },
          housingProject: {
            select: {
              projectId: true,
              projectName: true,
              companyNameRegistered: true,
              streetAddress: true,
              locality: true,
              province: true
            }
          }
        }
      }
    }
  });

  // Map the results to alias the project table as 'project'
  const permitsWithProjectAlias = permits.map((permit) => {
    const project =
      permit.activity.housingProject ?? permit.activity.generalProject ?? permit.activity.electrificationProject;

    return {
      permitId: permit.permitId,
      activityId: permit.activityId,
      permitTypeId: permit.permitTypeId,
      decisionDate: permit.decisionDate,
      stage: permit.stage,
      state: permit.state,
      statusLastChanged: permit.statusLastChanged,
      submittedDate: permit.submittedDate,
      permitType: permit.permitType,
      project
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

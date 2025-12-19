import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { IStamps } from '../interfaces/IStamps.ts';
import type {
  ElectrificationProject,
  ElectrificationProjectBase,
  ElectrificationProjectSearchParameters,
  ElectrificationProjectStatistics
} from '../types/index.ts';

/**
 *  Creates a new electrification project
 * @param tx Prisma transaction client
 * @param data The electrification project data to create
 * @returns A Promise that resolves to the created electrification project
 */
export const createElectrificationProject = async (
  tx: PrismaTransactionClient,
  data: ElectrificationProjectBase
): Promise<ElectrificationProject> => {
  const response = await tx.electrification_project.create({
    data: data,
    include: {
      activity: {
        include: {
          activityContact: {
            include: {
              contact: true
            }
          }
        }
      }
    }
  });
  return response;
};

/**
 * Soft delete an electrification project
 * @param tx Prisma transaction client
 * @param electrificationProjectId Unique electrification project ID
 * @param deleteStamp Timestamp information of the delete
 */
export const deleteElectrificationProject = async (
  tx: PrismaTransactionClient,
  electrificationProjectId: string,
  deleteStamp: Partial<IStamps>
): Promise<void> => {
  await tx.electrification_project.update({
    data: { deletedAt: deleteStamp.deletedAt, deletedBy: deleteStamp.deletedBy },
    where: { electrificationProjectId }
  });
};

/**
 * Gets a set of electrification project related statistics
 * @param tx Prisma transaction client
 * @param filters The filters to apply to the statistics
 * @returns A Promise that resolves to the electrification project statistics
 */
export const getElectrificationProjectStatistics = async (
  tx: PrismaTransactionClient,
  filters: {
    dateFrom: string;
    dateTo: string;
    monthYear: string;
    userId: string;
  }
): Promise<ElectrificationProjectStatistics[]> => {
  // Return a single quoted string or null for the given value
  const val = (value: unknown) => (value ? `'${value}'` : null);

  const dFrom = val(filters.dateFrom);
  const dTo = val(filters.dateTo);
  const monthYear = val(filters.monthYear);
  const userId = filters.userId?.length ? filters.userId : null;

  const response =
    await tx.$queryRaw`select * from get_electrification_statistics(${dFrom}, ${dTo}, ${monthYear}, ${userId}::uuid)`;

  // count() returns BigInt
  // JSON.stringify() doesn't know how to serialize BigInt
  // https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-521460510
  return JSON.parse(JSON.stringify(response, (_key, value) => (typeof value === 'bigint' ? Number(value) : value)));
};

/**
 * Gets a specific electrification project from the PCNS database
 * @param tx Prisma transaction client
 * @param  electrificationProjectId PCNS electrification project ID
 * @returns A Promise that resolves to the electrification project
 */
export const getElectrificationProject = async (
  tx: PrismaTransactionClient,
  electrificationProjectId: string
): Promise<ElectrificationProject> => {
  const result = await tx.electrification_project.findFirstOrThrow({
    where: {
      electrificationProjectId: electrificationProjectId
    },
    include: {
      activity: {
        include: {
          activityContact: {
            include: {
              contact: true
            }
          }
        }
      }
    }
  });

  return result;
};

/**
 * Gets a list of electrification projects
 * @param tx Prisma transaction client
 * @returns A Promise that resolves to an array of electrification projects
 */
export const getElectrificationProjects = async (tx: PrismaTransactionClient): Promise<ElectrificationProject[]> => {
  const result = await tx.electrification_project.findMany({
    include: {
      activity: {
        include: {
          activityContact: {
            include: {
              contact: true
            }
          }
        }
      },
      user: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return result;
};

/**
 * Search and filter for specific electrification projects
 * @param tx Prisma transaction client
 * @param params.activityId Optional array of uuids representing the activity ID
 * @param params.createdBy Optional array of uuids representing users who created electrification projects
 * @param params.electrificationProjectId Optional array of uuids representing the electrification project ID
 * @param params.projectType Optional array of strings representing the electrification project type
 * @param params.projectCategory Optional array of strings representing the electrification project category
 * @param params.includeUser Optional boolean representing whether the linked user should be included
 * @returns A Promise that resolves to an array of electrification projects from search params
 */
export const searchElectrificationProjects = async (
  tx: PrismaTransactionClient,
  params: ElectrificationProjectSearchParameters
): Promise<ElectrificationProject[]> => {
  const result = await tx.electrification_project.findMany({
    where: {
      AND: [
        {
          activityId: { in: params.activityId }
        },
        {
          createdBy: { in: params.createdBy }
        },
        {
          electrificationProjectId: { in: params.electrificationProjectId }
        },
        {
          projectType: { in: params.projectType }
        },
        {
          projectCategory: { in: params.projectCategory }
        }
      ]
    },
    include: {
      activity: {
        include: {
          activityContact: {
            include: {
              contact: true
            }
          }
        }
      },
      user: params.includeUser
    }
  });

  return result;
};

/**
 * Updates a specific electrification project
 * @param tx Prisma transaction client
 * @param data Electrification project to update
 * @returns A Promise that resolves to the updated electrification project
 */
export const updateElectrificationProject = async (
  tx: PrismaTransactionClient,
  data: ElectrificationProjectBase
): Promise<ElectrificationProject> => {
  const result = await tx.electrification_project.update({
    data: data,
    where: {
      electrificationProjectId: data.electrificationProjectId
    },
    include: {
      activity: {
        include: {
          activityContact: {
            include: {
              contact: true
            }
          }
        }
      }
    }
  });
  return result;
};

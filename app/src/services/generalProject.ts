import { Prisma } from '@prisma/client';

import { jsonToPrismaInputJson } from '../db/utils/utils.ts';

import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { IStamps } from '../interfaces/IStamps.ts';
import type {
  GeneralProject,
  GeneralProjectBase,
  GeneralProjectSearchParameters,
  GeneralProjectStatistics
} from '../types/index.ts';

/**
 * Creates a new general project
 * @param tx Prisma transaction client
 * @param data The general project data to create
 * @returns A Promise that resolves to the created general project
 */
export const createGeneralProject = async (
  tx: PrismaTransactionClient,
  data: GeneralProjectBase
): Promise<GeneralProject> => {
  const response = await tx.general_project.create({
    data: {
      ...data,
      geoJson: data.geoJson as Prisma.InputJsonValue
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
  return response;
};

/**
 * Delete a general project
 * @param tx Prisma transaction client
 * @param generalProjectId Unique general project ID
 * @param deleteStamp Timestamp information of the delete
 */
export const deleteGeneralProject = async (
  tx: PrismaTransactionClient,
  generalProjectId: string,
  deleteStamp: Partial<IStamps>
): Promise<void> => {
  await tx.general_project.update({
    data: { deletedAt: deleteStamp.deletedAt, deletedBy: deleteStamp.deletedBy },
    where: { generalProjectId }
  });
};

/**
 * @param tx Prisma transaction client
 * @param filters The filters to apply to the statistics
 * @param filters.dateFrom Beginning date
 * @param filters.dateTo End date
 * @param filters.monthYear Month/Year to search
 * @param filters.userId User ID
 * @returns A Promise that resolves to the general project statistics
 */
export const getGeneralProjectStatistics = async (
  tx: PrismaTransactionClient,
  filters: {
    dateFrom: string;
    dateTo: string;
    monthYear: string;
    userId: string;
  }
): Promise<GeneralProjectStatistics[]> => {
  // Return a single quoted string or null for the given value
  const val = (value: string) => (value ? `'${value}'` : null);

  const date_from = val(filters.dateFrom);
  const date_to = val(filters.dateTo);
  const month_year = val(filters.monthYear);
  const user_id = filters.userId?.length ? filters.userId : null;

  const response =
    await tx.$queryRaw`select * from get_general_statistics(${date_from}, ${date_to}, ${month_year}, ${user_id}::uuid)`;

  // count() returns BigInt
  // JSON.stringify() doesn't know how to serialize BigInt
  // https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-521460510
  return JSON.parse(
    JSON.stringify(response, (_key, value) => (typeof value === 'bigint' ? Number(value) : (value as unknown)))
  ) as GeneralProjectStatistics[];
};

/**
 * Gets a specific general project from the PCNS database
 * @param tx Prisma transaction client
 * @param generalProjectId PCNS general project ID
 * @returns A Promise that resolves to the specific general project
 */
export const getGeneralProject = async (
  tx: PrismaTransactionClient,
  generalProjectId: string
): Promise<GeneralProject> => {
  const result = await tx.general_project.findFirstOrThrow({
    where: {
      generalProjectId
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
 * Gets a list of general projects
 * @param tx Prisma transaction client
 * @returns A Promise that resolves to an array of general projects
 */
export const getGeneralProjects = async (tx: PrismaTransactionClient): Promise<GeneralProject[]> => {
  const result = await tx.general_project.findMany({
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
 * Search and filter for specific general projects
 * @param tx Prisma transaction client
 * @param params Optional filtering parameters
 * @param params.activityId Optional array of uuids representing the activity ID
 * @param params.createdBy Optional array of uuids representing users who created general projects
 * @param params.generalProjectId Optional array of uuids representing the general project ID
 * @param params.submissionType Optional array of strings representing the general submission type
 * @param params.includeUser Optional boolean representing whether the linked user should be included
 * @returns A Promise that resolves to an array of general projects from search params
 */
export const searchGeneralProjects = async (
  tx: PrismaTransactionClient,
  params: GeneralProjectSearchParameters
): Promise<GeneralProject[]> => {
  const result = await tx.general_project.findMany({
    where: {
      AND: [
        {
          activityId: { in: params.activityId }
        },
        {
          createdBy: { in: params.createdBy }
        },
        {
          generalProjectId: { in: params.generalProjectId }
        },
        {
          submissionType: { in: params.submissionType }
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
 * Updates a specific general project
 * @param tx Prisma transaction client
 * @param data General project to update
 * @returns A Promise that resolves to the updated general project
 */
export const updateGeneralProject = async (
  tx: PrismaTransactionClient,
  data: GeneralProjectBase
): Promise<GeneralProject> => {
  const result = await tx.general_project.update({
    data: {
      ...data,
      geoJson: jsonToPrismaInputJson(data.geoJson)
    },
    where: {
      generalProjectId: data.generalProjectId
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

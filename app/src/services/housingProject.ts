import { Prisma } from '@prisma/client';

import type { PrismaTransactionClient } from '../db/database.ts';
import type { IStamps } from '../interfaces/IStamps.ts';
import type {
  CurrentAuthorization,
  CurrentContext,
  HousingProject,
  HousingProjectBase,
  HousingProjectIntake,
  HousingProjectSearchParameters,
  HousingProjectStatistics,
  Permit
} from '../types/index.ts';
import { unitOfWork } from '../repository/uow.ts';
import { generateHousingProjectData } from '../domains/housingProject.ts';
import prisma from '../db/database.ts';
import { filterActivityResponseByScope } from '../parsers/responseFiltering.ts';

/**
 * Creates a new housing project
 * @param tx Prisma transaction client
 * @param data The housing project data to create
 * @returns A Promise that resolves to the created housing project
 */
// export const createHousingProject = async (
//   tx: PrismaTransactionClient,
//   data: HousingProjectBase
// ): Promise<HousingProject> => {
//   const response = await tx.housing_project.create({
//     data: {
//       ...data,
//       geoJson: data.geoJson as Prisma.InputJsonValue
//     },
//     include: {
//       activity: {
//         include: {
//           activityContact: {
//             include: {
//               contact: true
//             }
//           }
//         }
//       }
//     }
//   });
//   return response;
// };

//--------------------------------------------------------------------------------
// Housing Project
//--------------------------------------------------------------------------------

export const createHousingProjectService = async (
  data: HousingProjectIntake,
  currentContext: CurrentContext
): Promise<HousingProject> => {
  return await unitOfWork.execute(async ({ housingProject, permit }) => {
    const {
      housingProject: project,
      appliedPermits,
      investigatePermits
    } = await generateHousingProjectData({ housingProject }, data, currentContext);

    // Create new housing project
    const response = await housingProject.create({
      ...project,
      geoJson: project.geoJson as Prisma.InputJsonValue
    });

    // Create each permit and tracking IDs
    await Promise.all(
      appliedPermits.map(async (p: Permit) => {
        permit.upsert({ permitId: p.permitId }, p, p);
      })
    );
    // await Promise.all(
    //   appliedPermits.map(async (p: Permit) => {
    //     await upsertPermit(tx, omit(p, ['permitTracking']));
    //   })
    // );

    await Promise.all(investigatePermits.map(async (p: Permit) => await upsertPermit(tx, p)));
    await Promise.all(
      appliedPermits
        .filter((p: Permit) => !!p.permitTracking)
        .map(async (p: Permit) => await upsertPermitTracking(tx, p))
    );

    return response;
  });
};

export const deleteHousingProjectService = async (housingProjectId: string): Promise<void> => {
  return await unitOfWork.execute(async ({ activity, housingProject }) => {
    const project = await housingProject.findUniqueOrThrow({ where: { housingProjectId } });
    await housingProject.delete({ housingProjectId });
    await activity.delete({ activityId: project?.activityId });
  });
};

export const listHousingProjectActivityIdsService = async (): Promise<string[]> => {
  return await unitOfWork.execute(async ({ housingProject }) => {
    const projects = await housingProject.findMany({ select: { activityId: true } });
    return projects.map((x) => x.activityId);
  });
};

/**
 * Gets a specific housing project from the PCNS database
 * @param housingProjectId PCNS housing project ID
 * @returns A Promise that resolves to the specific housing project
 */
export const getHousingProjectService = async (housingProjectId: string): Promise<HousingProject> => {
  return await unitOfWork.execute(async ({ housingProject }) => {
    return housingProject.findFirstOrThrow({
      where: {
        housingProjectId
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
  });
};

/**
 * Gets a list of housing projects
 * @param currentAuthorization - Authorizations assigned to the current authorized user
 * @param currentContext - Context data of current request
 * @returns A Promise that resolves to an array of housing projects
 */
export const listHousingProjectsService = async (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext
): Promise<HousingProject[]> => {
  return await unitOfWork.execute(async ({ activityContact, contact, housingProject }) => {
    const result = await housingProject.findMany({
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

    return await filterActivityResponseByScope(
      { activityContact, contact },
      currentAuthorization,
      currentContext,
      result
    );
  });
};

/**
 * @param filters The filters to apply to the statistics
 * @param filters.dateFrom Beginning date
 * @param filters.dateTo End date
 * @param filters.monthYear Month/Year to search
 * @param filters.userId User ID
 * @returns A Promise that resolves to the housing project statistics
 */
export const getHousingProjectStatisticsService = async (filters: {
  dateFrom: string;
  dateTo: string;
  monthYear: string;
  userId: string;
}): Promise<HousingProjectStatistics[]> => {
  // Return a single quoted string or null for the given value
  const val = (value: string) => (value ? `'${value}'` : null);

  const date_from = val(filters.dateFrom);
  const date_to = val(filters.dateTo);
  const month_year = val(filters.monthYear);
  const user_id = filters.userId?.length ? filters.userId : null;

  const response = // eslint-disable-next-line max-len
    await prisma.$queryRaw`select * from get_housing_statistics(${date_from}, ${date_to}, ${month_year}, ${user_id}::uuid)`;

  // count() returns BigInt
  // JSON.stringify() doesn't know how to serialize BigInt
  // https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-521460510
  return JSON.parse(
    JSON.stringify(response, (_key, value) => (typeof value === 'bigint' ? Number(value) : (value as unknown)))
  ) as HousingProjectStatistics[];
};

/**
 * Search and filter for specific housing projects
 * @param currentAuthorization - Authorizations assigned to the current authorized user
 * @param currentContext - Context data of current request
 * @param params - Optional filtering parameters
 * @param params.activityId - Optional array of uuids representing the activity ID
 * @param params.createdBy - Optional array of uuids representing users who created housing projects
 * @param params.housingProjectId - Optional array of uuids representing the housing project ID
 * @param params.submissionType - Optional array of strings representing the housing submission type
 * @param params.includeUser - Optional boolean representing whether the linked user should be included
 * @returns A Promise that resolves to an array of housing projects from search params
 */
export const searchHousingProjects = async (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext,
  params: HousingProjectSearchParameters
): Promise<HousingProject[]> => {
  return await unitOfWork.execute(async ({ activityContact, contact, housingProject }) => {
    const result = await housingProject.search(params);

    return await filterActivityResponseByScope(
      { activityContact, contact },
      currentAuthorization,
      currentContext,
      result
    );
  });
};

/**
 * Updates a specific housing project
 * @param data Housing project to update
 * @param housingProjectId ID of the project to update
 * @returns A Promise that resolves to the updated housing project
 */
export const updateHousingProjectService = async (
  data: Omit<Prisma.housing_projectUpdateInput, 'housingProjectId'>,
  housingProjectId: string
): Promise<HousingProject> => {
  return await unitOfWork.execute(async ({ housingProject }) => {
    await housingProject.update(
      {
        housingProjectId
      },
      data
    );

    return await housingProject.findFirstOrThrow({
      where: {
        housingProjectId
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
  });
};

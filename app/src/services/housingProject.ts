import { Prisma } from '@prisma/client';

import prisma from '../db/database.ts';
import { emailProjectConfirmation, generateHousingProjectData } from '../domains/housingProject.ts';
import { upsertPermitTracking } from '../domains/permitTracking.ts';
import { filterActivityResponseByScope } from '../parsers/responseFiltering.ts';
import { unitOfWork } from '../repository/uow.ts';

import type {
  ContactBase,
  CurrentAuthorization,
  CurrentContext,
  HousingProject,
  HousingProjectIntake,
  HousingProjectSearchParameters,
  HousingProjectStatistics,
  Maybe
} from '../types/index.ts';

export const createHousingProjectService = async (
  data: HousingProjectIntake,
  currentContext: CurrentContext
): Promise<HousingProject> => {
  return await unitOfWork.execute(
    async ({ activity, activityContact, contact, housingProject, initiative, permit, permitTracking }) => {
      const {
        housingProject: project,
        appliedPermits,
        investigatePermits,
        appliedPermitTrackers
      } = await generateHousingProjectData({ activity, activityContact, contact, initiative }, data, currentContext);

      // Create new housing project
      const response = await housingProject.create({
        ...project,
        geoJson: project.geoJson as Prisma.InputJsonValue
      });

      // Create each permit and tracking IDs
      await Promise.all(
        appliedPermits.map(async (p) => {
          permit.upsert({ permitId: p.permitId }, p, p);
        })
      );
      await Promise.all(investigatePermits.map(async (p) => permit.upsert({ permitId: p.permitId }, p, p)));
      await Promise.all(appliedPermitTrackers.map(async (pt) => upsertPermitTracking({ permitTracking }, pt)));

      return response;
    }
  );
};

export const deleteHousingProjectService = async (housingProjectId: string): Promise<void> => {
  return await unitOfWork.execute(async ({ activity, housingProject }) => {
    const project = await housingProject.findUniqueOrThrow({ where: { housingProjectId } });
    await housingProject.delete({ housingProjectId });
    await activity.delete({ activityId: project?.activityId });
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

export const listHousingProjectActivityIdsService = async (): Promise<string[]> => {
  return await unitOfWork.execute(async ({ housingProject }) => {
    const ids = await housingProject.findMany({ select: { activityId: true } });
    return ids.map((x) => x.activityId);
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

export const submitHousingProjectDraftService = async (
  draftId: Maybe<string>,
  data: HousingProjectIntake,
  contactData: ContactBase,
  currentContext: CurrentContext
): Promise<HousingProject> => {
  return await unitOfWork.execute(
    async ({ activity, activityContact, contact, draft, housingProject, initiative, permit, permitTracking }) => {
      const {
        housingProject: project,
        appliedPermits,
        investigatePermits,
        appliedPermitTrackers
      } = await generateHousingProjectData({ activity, activityContact, contact, initiative }, data, currentContext);

      // Create new housing project
      const response = await housingProject.create({
        ...project,
        geoJson: project.geoJson as Prisma.InputJsonValue
      });

      // Create each permit and tracking IDs
      await Promise.all(
        appliedPermits.map(async (p) => {
          permit.upsert({ permitId: p.permitId }, p, p);
        })
      );
      await Promise.all(investigatePermits.map(async (p) => permit.upsert({ permitId: p.permitId }, p, p)));
      await Promise.all(appliedPermitTrackers.map(async (pt) => upsertPermitTracking({ permitTracking }, pt)));

      // Delete old draft
      if (draftId) await draft.delete({ draftId });

      // Update the contact
      const contactResponse = await contact.upsert({ contactId: contactData.contactId }, contactData, contactData);

      await emailProjectConfirmation({ ...response, contact: contactResponse });

      return response;
    }
  );
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

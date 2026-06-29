import { Prisma } from '@prisma/client';

import type {
  ContactBase,
  CurrentAuthorization,
  CurrentContext,
  ElectrificationProject,
  ElectrificationProjectIntake,
  ElectrificationProjectSearchParameters,
  ElectrificationProjectStatistics,
  Maybe
} from '../types/index.ts';
import { unitOfWork } from '../repository/unitOfWork.ts';
import { emailProjectConfirmation, generateElectrificationProjectData } from '../domains/electrificationProject.ts';
import prisma from '../db/database.ts';
import { filterActivityResponseByScope } from '../parsers/responseFiltering.ts';

export const createElectrificationProjectService = async (
  data: ElectrificationProjectIntake,
  currentContext: CurrentContext
): Promise<ElectrificationProject> => {
  return await unitOfWork.execute(
    async ({ activity, activityContact, contact, electrificationProject, initiative }) => {
      const electrificationProjectData = await generateElectrificationProjectData(
        { activity, activityContact, contact, initiative },
        data,
        currentContext
      );

      // Create new electrification project
      const response = await electrificationProject.create(electrificationProjectData);

      return response;
    }
  );
};

export const deleteElectrificationProjectService = async (electrificationProjectId: string): Promise<void> => {
  return await unitOfWork.execute(async ({ activity, electrificationProject }) => {
    const project = await electrificationProject.findUniqueOrThrow({ where: { electrificationProjectId } });
    await electrificationProject.delete({ electrificationProjectId });
    await activity.delete({ activityId: project?.activityId });
  });
};

/**
 * Gets a specific electrification project from the PCNS database
 * @param electrificationProjectId PCNS electrification project ID
 * @returns A Promise that resolves to the specific electrification project
 */
export const getElectrificationProjectService = async (
  electrificationProjectId: string
): Promise<ElectrificationProject> => {
  return await unitOfWork.execute(async ({ electrificationProject }) => {
    return electrificationProject.findFirstOrThrow({
      where: {
        electrificationProjectId
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
 * Gets a set of electrification project related statistics
 * @param filters The filters to apply to the statistics
 * @param filters.dateFrom Beginning date
 * @param filters.dateTo End date
 * @param filters.monthYear Month/Year to search
 * @param filters.userId User ID
 * @returns A Promise that resolves to the electrification project statistics
 */
export const getElectrificationProjectStatisticsService = async (filters: {
  dateFrom: string;
  dateTo: string;
  monthYear: string;
  userId: string;
}): Promise<ElectrificationProjectStatistics[]> => {
  // Return a single quoted string or null for the given value
  const val = (value: string) => (value ? `'${value}'` : null);

  const dFrom = val(filters.dateFrom);
  const dTo = val(filters.dateTo);
  const monthYear = val(filters.monthYear);
  const userId = filters.userId?.length ? filters.userId : null;

  const response = // eslint-disable-next-line max-len
    await prisma.$queryRaw`select * from get_electrification_statistics(${dFrom}, ${dTo}, ${monthYear}, ${userId}::uuid)`;

  // count() returns BigInt
  // JSON.stringify() doesn't know how to serialize BigInt
  // https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-521460510
  return JSON.parse(
    JSON.stringify(response, (_key, value) => (typeof value === 'bigint' ? Number(value) : (value as unknown)))
  ) as ElectrificationProjectStatistics[];
};

export const listElectrificationProjectActivityIdsService = async (): Promise<string[]> => {
  return await unitOfWork.execute(async ({ electrificationProject }) => {
    const ids = await electrificationProject.findMany({ select: { activityId: true } });
    return ids.map((x) => x.activityId);
  });
};

/**
 * Gets a list of electrification projects
 * @param currentAuthorization - Authorizations assigned to the current authorized user
 * @param currentContext - Context data of current request
 * @returns A Promise that resolves to an array of electrification projects
 */
export const listElectrificationProjectsService = async (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext
): Promise<ElectrificationProject[]> => {
  return await unitOfWork.execute(async ({ activityContact, contact, electrificationProject }) => {
    const result = await electrificationProject.findMany({
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
 * Search and filter for specific electrification projects
 * @param currentAuthorization - Authorizations assigned to the current authorized user
 * @param currentContext - Context data of current request
 * @param params - Optional filtering parameters
 * @param params.activityId - Optional array of uuids representing the activity ID
 * @param params.createdBy - Optional array of uuids representing users who created electrification projects
 * @param params.electrificationProjectId - Optional array of uuids representing the electrification project ID
 * @param params.submissionType - Optional array of strings representing the electrification submission type
 * @param params.includeUser - Optional boolean representing whether the linked user should be included
 * @returns A Promise that resolves to an array of electrification projects from search params
 */
export const searchElectrificationProjects = async (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext,
  params: ElectrificationProjectSearchParameters
): Promise<ElectrificationProject[]> => {
  return await unitOfWork.execute(async ({ activityContact, contact, electrificationProject }) => {
    const result = await electrificationProject.search(params);

    return await filterActivityResponseByScope(
      { activityContact, contact },
      currentAuthorization,
      currentContext,
      result
    );
  });
};

export const submitElectrificationProjectDraftService = async (
  draftId: Maybe<string>,
  data: ElectrificationProjectIntake,
  contactData: ContactBase,
  currentContext: CurrentContext
): Promise<ElectrificationProject> => {
  return await unitOfWork.execute(
    async ({ activity, activityContact, contact, draft, electrificationProject, initiative }) => {
      const electrificationProjectData = await generateElectrificationProjectData(
        { activity, activityContact, contact, initiative },
        data,
        currentContext
      );

      // Create new electrification project
      const response = await electrificationProject.create(electrificationProjectData);

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
 * Updates a specific electrification project
 * @param data Electrification project to update
 * @param electrificationProjectId ID of the project to update
 * @returns A Promise that resolves to the updated electrification project
 */
export const updateElectrificationProjectService = async (
  data: Omit<Prisma.electrification_projectUpdateInput, 'electrificationProjectId'>,
  electrificationProjectId: string
): Promise<ElectrificationProject> => {
  return await unitOfWork.execute(async ({ electrificationProject }) => {
    await electrificationProject.update(
      {
        electrificationProjectId
      },
      data
    );

    return await electrificationProject.findFirstOrThrow({
      where: {
        electrificationProjectId
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

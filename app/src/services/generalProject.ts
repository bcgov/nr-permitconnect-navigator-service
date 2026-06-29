import { Prisma } from '@prisma/client';

import prisma from '../db/database.ts';
import { emailProjectConfirmation, generateGeneralProjectData } from '../domains/generalProject.ts';
import { upsertPermitTracking } from '../domains/permitTracking.ts';

import { filterActivityResponseByScope } from '../parsers/responseFiltering.ts';
import { unitOfWork } from '../repository/unitOfWork.ts';

import type {
  ContactBase,
  CurrentAuthorization,
  CurrentContext,
  GeneralProject,
  GeneralProjectIntake,
  GeneralProjectSearchParameters,
  GeneralProjectStatistics,
  Maybe
} from '../types/index.ts';

export const createGeneralProjectService = async (
  data: GeneralProjectIntake,
  currentContext: CurrentContext
): Promise<GeneralProject> => {
  return await unitOfWork.execute(
    async ({ activity, activityContact, contact, generalProject, initiative, permit, permitTracking }) => {
      const {
        generalProject: project,
        appliedPermits,
        investigatePermits,
        appliedPermitTrackers
      } = await generateGeneralProjectData({ activity, activityContact, contact, initiative }, data, currentContext);

      // Create new general project
      const response = await generalProject.create({
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

export const deleteGeneralProjectService = async (generalProjectId: string): Promise<void> => {
  return await unitOfWork.execute(async ({ activity, generalProject }) => {
    const project = await generalProject.findUniqueOrThrow({ where: { generalProjectId } });
    await generalProject.delete({ generalProjectId });
    await activity.delete({ activityId: project?.activityId });
  });
};

export const listGeneralProjectActivityIdsService = async (): Promise<string[]> => {
  return await unitOfWork.execute(async ({ generalProject }) => {
    const ids = await generalProject.findMany({ select: { activityId: true } });
    return ids.map((x) => x.activityId);
  });
};

export const getGeneralProjectService = async (generalProjectId: string): Promise<GeneralProject> => {
  return await unitOfWork.execute(async ({ generalProject }) => {
    return generalProject.findFirstOrThrow({
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
  });
};

export const listGeneralProjectsService = async (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext
): Promise<GeneralProject[]> => {
  return await unitOfWork.execute(async ({ activityContact, contact, generalProject }) => {
    const result = await generalProject.findMany({
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

export const getGeneralProjectStatisticsService = async (filters: {
  dateFrom: string;
  dateTo: string;
  monthYear: string;
  userId: string;
}): Promise<GeneralProjectStatistics[]> => {
  // Return a single quoted string or null for the given value
  const val = (value: string) => (value ? `'${value}'` : null);

  const date_from = val(filters.dateFrom);
  const date_to = val(filters.dateTo);
  const month_year = val(filters.monthYear);
  const user_id = filters.userId?.length ? filters.userId : null;

  const response = // eslint-disable-next-line max-len
    await prisma.$queryRaw`select * from get_general_statistics(${date_from}, ${date_to}, ${month_year}, ${user_id}::uuid)`;

  // count() returns BigInt
  // JSON.stringify() doesn't know how to serialize BigInt
  // https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-521460510
  return JSON.parse(
    JSON.stringify(response, (_key, value) => (typeof value === 'bigint' ? Number(value) : (value as unknown)))
  ) as GeneralProjectStatistics[];
};

/**
 * Search and filter for specific general projects
 * @param currentAuthorization - Authorizations assigned to the current authorized user
 * @param currentContext - Context data of current request
 * @param params - Optional filtering parameters
 * @param params.activityId - Optional array of uuids representing the activity ID
 * @param params.createdBy - Optional array of uuids representing users who created general projects
 * @param params.generalProjectId - Optional array of uuids representing the general project ID
 * @param params.submissionType - Optional array of strings representing the general submission type
 * @param params.includeUser - Optional boolean representing whether the linked user should be included
 * @returns A Promise that resolves to an array of general projects from search params
 */
export const searchGeneralProjects = async (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext,
  params: GeneralProjectSearchParameters
): Promise<GeneralProject[]> => {
  return await unitOfWork.execute(async ({ activityContact, contact, generalProject }) => {
    const result = await generalProject.search(params);

    return await filterActivityResponseByScope(
      { activityContact, contact },
      currentAuthorization,
      currentContext,
      result
    );
  });
};

export const submitGeneralProjectDraftService = async (
  draftId: Maybe<string>,
  data: GeneralProjectIntake,
  contactData: ContactBase,
  currentContext: CurrentContext
): Promise<GeneralProject> => {
  return await unitOfWork.execute(
    async ({ activity, activityContact, contact, draft, generalProject, initiative, permit, permitTracking }) => {
      const {
        generalProject: project,
        appliedPermits,
        investigatePermits,
        appliedPermitTrackers
      } = await generateGeneralProjectData({ activity, activityContact, contact, initiative }, data, currentContext);

      // Create new general project
      const response = await generalProject.create({
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
 * Updates a specific general project
 * @param data General project to update
 * @param generalProjectId ID of the project to update
 * @returns A Promise that resolves to the updated general project
 */
export const updateGeneralProjectService = async (
  data: Omit<Prisma.general_projectUpdateInput, 'generalProjectId'>,
  generalProjectId: string
): Promise<GeneralProject> => {
  return await unitOfWork.execute(async ({ generalProject }) => {
    await generalProject.update(
      {
        generalProjectId
      },
      data
    );

    return await generalProject.findFirstOrThrow({
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
  });
};

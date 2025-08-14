import axios from 'axios';
import config from 'config';
import { Prisma } from '@prisma/client';

import prisma from '../db/dataConnection';
import { jsonToPrismaInputJson } from '../db/utils/utils';
import { Initiative } from '../utils/enums/application';
import { ApplicationStatus } from '../utils/enums/projectCommon';
import { getChefsApiKey } from '../utils/utils';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { PrismaTransactionClient } from '../db/dataConnection';
import type { IStamps } from '../interfaces/IStamps';
import type {
  HousingProject,
  HousingProjectBase,
  HousingProjectSearchParameters,
  HousingProjectStatistics
} from '../types';

/**
 * Returns an Axios instance for the CHEFS API
 * @param options Axios request config options
 * @returns An axios instance
 */
function chefsAxios(formId: string, options: AxiosRequestConfig = {}): AxiosInstance {
  return axios.create({
    baseURL: config.get('server.chefs.apiPath'),
    timeout: 10000,
    auth: { username: formId, password: getChefsApiKey(formId) ?? '' },
    ...options
  });
}

/**
 * Creates a new housing project
 * @param tx Prisma transaction client
 * @param data The housing project data to create
 * @returns A Promise that resolves to the created housing project
 */
export const createHousingProject = async (
  tx: PrismaTransactionClient,
  data: HousingProjectBase
): Promise<HousingProject> => {
  const response = await tx.housing_project.create({
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
 * @function createHousingProjectsFromExport
 * Creates the given activities and housing projects from exported CHEFS data
 * @param tx Prisma transaction client
 * @param housingProjects Array of housing projects
 * @returns The result of running the transaction
 */
export const createHousingProjectsFromExport = async (
  tx: PrismaTransactionClient,
  housingProjects: Array<Partial<HousingProject>>
) => {
  // TODO-PR: Rewrite service call to use tx client param, move transaction up to controller layer.
  await prisma.$transaction(async (trx) => {
    const initiative = await trx.initiative.findFirstOrThrow({
      where: {
        code: Initiative.HOUSING
      }
    });

    await trx.activity.createMany({
      data: housingProjects.map((x) => ({
        activityId: x.activityId as string,
        initiativeId: initiative.initiativeId,
        isDeleted: false
      }))
    });

    await trx.housing_project.createMany({
      data: housingProjects.map((x) => ({
        housingProjectId: x.housingProjectId as string,
        activityId: x.activityId as string,
        applicationStatus: ApplicationStatus.NEW,
        companyNameRegistered: x.companyNameRegistered,
        financiallySupported: x.financiallySupported,
        financiallySupportedBc: x.financiallySupportedBc,
        financiallySupportedIndigenous: x.financiallySupportedIndigenous,
        financiallySupportedNonProfit: x.financiallySupportedNonProfit,
        financiallySupportedHousingCoop: x.financiallySupportedHousingCoop,
        hasAppliedProvincialPermits: x.hasAppliedProvincialPermits,
        housingCoopDescription: x.housingCoopDescription,
        indigenousDescription: x.indigenousDescription,
        projectApplicantType: x.projectApplicantType,
        isDevelopedInBc: x.isDevelopedInBc,
        intakeStatus: x.intakeStatus,
        locationPids: x.locationPids,
        latitude: parseFloat(x.latitude as unknown as string),
        locality: x.locality,
        longitude: parseFloat(x.longitude as unknown as string),
        naturalDisaster: x.naturalDisaster,
        nonProfitDescription: x.nonProfitDescription,
        projectLocation: x.projectLocation,
        projectName: x.projectName,
        projectDescription: x.projectDescription,
        province: x.province,
        queuePriority: x.queuePriority,
        rentalUnits: x.rentalUnits?.toString(),
        singleFamilyUnits: x.singleFamilyUnits,
        multiFamilyUnits: x.multiFamilyUnits,
        otherUnits: x.otherUnits,
        otherUnitsDescription: x.otherUnitsDescription,
        hasRentalUnits: x.hasRentalUnits,
        streetAddress: x.streetAddress,
        submittedAt: new Date(x.submittedAt ?? Date.now()),
        submittedBy: x.submittedBy as string
      }))
    });
  });
};

/**
 * @function getFormExport
 * Gets a full data export for the requested CHEFS form
 * @param {string} formId CHEFS form id
 * @returns {Promise<any>} The result of running the get operation
 */
export const getFormExport = async (formId: string) => {
  const response = await chefsAxios(formId).get(`forms/${formId}/export`, {
    params: { format: 'json', type: 'submissions' }
  });
  return response.data;
};

/**
 * @function getHousingProjectStatistics
 * Gets a set of housing project related statistics
 * @param tx Prisma transaction client
 * @param filters The filters to apply to the statistics
 * @returns A Promise that resolves to the housing project statistics
 */
export const getHousingProjectStatistics = async (
  tx: PrismaTransactionClient,
  filters: {
    dateFrom: string;
    dateTo: string;
    monthYear: string;
    userId: string;
  }
): Promise<HousingProjectStatistics[]> => {
  // Return a single quoted string or null for the given value
  const val = (value: unknown) => (value ? `'${value}'` : null);

  const date_from = val(filters.dateFrom);
  const date_to = val(filters.dateTo);
  const month_year = val(filters.monthYear);
  const user_id = filters.userId?.length ? filters.userId : null;

  const response =
    await tx.$queryRaw`select * from get_housing_statistics(${date_from}, ${date_to}, ${month_year}, ${user_id}::uuid)`;

  // TODO-PR: Will this BigInt issue be handled with numeric prisma extension?
  // count() returns BigInt
  // JSON.stringify() doesn't know how to serialize BigInt
  // https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-521460510
  return JSON.parse(JSON.stringify(response, (_key, value) => (typeof value === 'bigint' ? Number(value) : value)));
};

/**
 * Gets a specific housing project from the PCNS database
 * @param tx Prisma transaction client
 * @param housingProjectId PCNS housing project ID
 * @returns A Promise that resolves to the specific housing project
 */
export const getHousingProject = async (
  tx: PrismaTransactionClient,
  housingProjectId: string
): Promise<HousingProject> => {
  const result = await tx.housing_project.findFirstOrThrow({
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

  return result;
};

/**
 * Gets a list of housing projects
 * @param tx Prisma transaction client
 * @returns A Promise that resolves to an array of housing projects
 */
export const getHousingProjects = async (tx: PrismaTransactionClient): Promise<HousingProject[]> => {
  const result = await tx.housing_project.findMany({
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
 * Search and filter for specific housing projects
 * @param tx Prisma transaction client
 * @param params.activityId Optional array of uuids representing the activity ID
 * @param params.createdBy Optional array of uuids representing users who created housing projects
 * @param params.housingProjectId Optional array of uuids representing the housing project ID
 * @param params.submissionType Optional array of strings representing the housing submission type
 * @param params.intakeStatus Optional array of strings representing the intake status
 * @param params.includeUser Optional boolean representing whether the linked user should be included
 * @returns A Promise that resolves to an array of housing projects from search params
 */
export const searchHousingProjects = async (
  tx: PrismaTransactionClient,
  params: HousingProjectSearchParameters
): Promise<HousingProject[]> => {
  const result = await tx.housing_project.findMany({
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
    },
    where: {
      AND: [
        {
          activityId: { in: params.activityId }
        },
        {
          createdBy: { in: params.createdBy }
        },
        {
          housingProjectId: { in: params.housingProjectId }
        },
        {
          submissionType: { in: params.submissionType }
        },
        {
          intakeStatus: { in: params.intakeStatus }
        }
      ]
    }
  });

  return result;
};

/**
 * Updates is_deleted flag for the corresponding activity
 * @param tx Prisma transaction client
 * @param {string} housingProjectId Housing project ID
 * @param {string} isDeleted flag
 * @returns {Promise<HousingProject>} The result of running the delete operation
 */
export const updateHousingProjectIsDeletedFlag = async (
  tx: PrismaTransactionClient,
  housingProjectId: string,
  isDeleted: boolean,
  updateStamp: Partial<IStamps>
): Promise<HousingProject> => {
  // TODO-PR: Drop this service function, move project search to controller layer
  // and add delete activity service call to controller layer
  const deleteHousingProject = await tx.housing_project.findUniqueOrThrow({
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

  if (deleteHousingProject) {
    await tx.activity.update({
      data: { isDeleted: isDeleted, updatedAt: updateStamp.updatedAt, updatedBy: updateStamp.updatedBy },
      where: {
        activityId: deleteHousingProject?.activityId
      }
    });
  }

  return deleteHousingProject;
};

/**
 * Updates a specific housing project
 * @param tx Prisma transaction client
 * @param data Housing project to update
 * @returns A Promise that resolves to the updated housing project
 */
export const updateHousingProject = async (
  tx: PrismaTransactionClient,
  data: HousingProjectBase
): Promise<HousingProject> => {
  const result = await tx.housing_project.update({
    data: {
      ...data,
      geoJson: jsonToPrismaInputJson(data.geoJson)
    },
    where: {
      housingProjectId: data.housingProjectId
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

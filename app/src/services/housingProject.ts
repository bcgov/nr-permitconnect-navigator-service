import axios from 'axios';
import config from 'config';
import { Prisma } from '@prisma/client';

import prisma from '../db/dataConnection';
import { jsonToPrismaInputJson } from '../db/utils/utils';
import { Initiative } from '../utils/enums/application';
import { ApplicationStatus } from '../utils/enums/projectCommon';
import { getChefsApiKey } from '../utils/utils';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { IStamps } from '../interfaces/IStamps';
import type { HousingProject, HousingProjectBase, HousingProjectSearchParameters } from '../types';

/**
 * @function chefsAxios
 * Returns an Axios instance for the CHEFS API
 * @param {AxiosRequestConfig} options Axios request config options
 * @returns {AxiosInstance} An axios instance
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
 * @function createHousingProject
 * Creates a new housing project
 * @returns {Promise<HousingProject>} The result of running the transaction
 */
export const createHousingProject = async (data: HousingProjectBase): Promise<HousingProject> => {
  const response = await prisma.housing_project.create({
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
 * @param {Array<Partial<HousingProject>>} housingProjects Array of housing projects
 * @returns {Promise<void>} The result of running the transaction
 */
export const createHousingProjectsFromExport = async (housingProjects: Array<Partial<HousingProject>>) => {
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
 * @returns {Promise<object>} The result of running the query
 */
export const getHousingProjectStatistics = async (filters: {
  dateFrom: string;
  dateTo: string;
  monthYear: string;
  userId: string;
}) => {
  // Return a single quoted string or null for the given value
  const val = (value: unknown) => (value ? `'${value}'` : null);

  const date_from = val(filters.dateFrom);
  const date_to = val(filters.dateTo);
  const month_year = val(filters.monthYear);
  const user_id = filters.userId?.length ? filters.userId : null;

  /* eslint-disable max-len */
  const response =
    await prisma.$queryRaw`select * from get_housing_statistics(${date_from}, ${date_to}, ${month_year}, ${user_id}::uuid)`;
  /* eslint-enable max-len */

  // count() returns BigInt
  // JSON.stringify() doesn't know how to serialize BigInt
  // https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-521460510
  return JSON.parse(JSON.stringify(response, (_key, value) => (typeof value === 'bigint' ? Number(value) : value)));
};

/**
 * @function getHousingProject
 * Gets a specific housing project from the PCNS database
 * @param {string} housingProjectId PCNS housing project ID
 * @returns {Promise<HousingProject | null>} The result of running the findFirst operation
 */
export const getHousingProject = async (housingProjectId: string): Promise<HousingProject> => {
  const result = await prisma.housing_project.findFirstOrThrow({
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
 * @function getHousingProjects
 * Gets a list of housing projects
 * @returns {Promise<(HousingProject | null)[]>} The result of running the findMany operation
 */
export const getHousingProjects = async (): Promise<HousingProject[]> => {
  const result = await prisma.housing_project.findMany({
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
 * @function searchHousingProjects
 * Search and filter for specific housing projects
 * @param {string[]} [params.activityId] Optional array of uuids representing the activity ID
 * @param {string[]} [params.createdBy] Optional array of uuids representing users who created housing projects
 * @param {string[]} [params.housingProjectId] Optional array of uuids representing the housing project ID
 * @param {string[]} [params.submissionType] Optional array of strings representing the housing submission type
 * @param {string[]} [params.intakeStatus] Optional array of strings representing the intake status
 * @param {boolean}  [params.includeUser] Optional boolean representing whether the linked user should be included
 * @returns {Promise<(HousingProject | null)[]>} The result of running the findMany operation
 */
export const searchHousingProjects = async (params: HousingProjectSearchParameters): Promise<HousingProject[]> => {
  const result = await prisma.housing_project.findMany({
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
 * @function updateHousingProjectIsDeletedFlag
 * Updates is_deleted flag for the corresponding activity
 * @param {string} housingProjectId Housing project ID
 * @param {string} isDeleted flag
 * @returns {Promise<HousingProject>} The result of running the delete operation
 */
export const updateHousingProjectIsDeletedFlag = async (
  housingProjectId: string,
  isDeleted: boolean,
  updateStamp: Partial<IStamps>
): Promise<HousingProject> => {
  const deleteHousingProject = await prisma.housing_project.findUniqueOrThrow({
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
    await prisma.activity.update({
      data: { isDeleted: isDeleted, updatedAt: updateStamp.updatedAt, updatedBy: updateStamp.updatedBy },
      where: {
        activityId: deleteHousingProject?.activityId
      }
    });
  }

  return deleteHousingProject;
};

/**
 * @function updateHousingProject
 * Updates a specific housing project
 * @param {HousingProject} data Housing project to update
 * @returns {Promise<HousingProject | null>} The result of running the update operation
 */
export const updateHousingProject = async (data: HousingProjectBase): Promise<HousingProject> => {
  const { activityId, ...rest } = data;
  const result = await prisma.housing_project.update({
    data: {
      ...rest,
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

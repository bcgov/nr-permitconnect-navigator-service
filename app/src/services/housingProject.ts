/* eslint-disable no-useless-catch */
import axios from 'axios';
import config from 'config';
import { Prisma } from '@prisma/client';

import prisma from '../db/dataConnection';
import { housing_project } from '../db/models';
import { BasicResponse, Initiative } from '../utils/enums/application';
import { ApplicationStatus } from '../utils/enums/housing';
import { getChefsApiKey } from '../utils/utils';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { IStamps } from '../interfaces/IStamps';
import type { HousingProject, HousingProjectSearchParameters } from '../types';

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

const service = {
  /**
   * @function createHousingProject
   * Creates a new housing project
   * @returns {Promise<Partial<HousingProject>>} The result of running the transaction
   */
  createHousingProject: async (data: Partial<HousingProject>) => {
    const s = housing_project.toPrismaModel(data as HousingProject);
    const response = await prisma.housing_project.create({
      data: {
        ...s,
        geo_json: s.geo_json as Prisma.InputJsonValue,
        created_at: data.createdAt,
        created_by: data.createdBy
      },
      include: {
        activity: {
          include: {
            activity_contact: {
              include: {
                contact: true
              }
            }
          }
        }
      }
    });
    return housing_project.fromPrismaModelWithContact(response);
  },

  /**
   * @function createHousingProjectsFromExport
   * Creates the given activities and housing projects from exported CHEFS data
   * @param {Array<Partial<HousingProject>>} housingProjects Array of housing projects
   * @returns {Promise<void>} The result of running the transaction
   */
  createHousingProjectsFromExport: async (housingProjects: Array<Partial<HousingProject>>) => {
    await prisma.$transaction(async (trx) => {
      const initiative = await trx.initiative.findFirstOrThrow({
        where: {
          code: Initiative.HOUSING
        }
      });

      await trx.activity.createMany({
        data: housingProjects.map((x) => ({
          activity_id: x.activityId as string,
          initiative_id: initiative.initiative_id,
          is_deleted: false
        }))
      });

      await trx.housing_project.createMany({
        data: housingProjects.map((x) => ({
          housing_project_id: x.housingProjectId as string,
          activity_id: x.activityId as string,
          application_status: ApplicationStatus.NEW,
          company_name_registered: x.companyNameRegistered,
          financially_supported: x.financiallySupported,
          financially_supported_bc: x.financiallySupportedBC,
          financially_supported_indigenous: x.financiallySupportedIndigenous,
          financially_supported_non_profit: x.financiallySupportedNonProfit,
          financially_supported_housing_coop: x.financiallySupportedHousingCoop,
          has_applied_provincial_permits: x.hasAppliedProvincialPermits,
          housing_coop_description: x.housingCoopDescription,
          indigenous_description: x.indigenousDescription,
          project_applicant_type: x.projectApplicantType,
          is_developed_in_bc: x.isDevelopedInBC,
          intake_status: x.intakeStatus,
          location_pids: x.locationPIDs,
          latitude: parseFloat(x.latitude as unknown as string),
          locality: x.locality,
          longitude: parseFloat(x.longitude as unknown as string),
          natural_disaster: x.naturalDisaster === BasicResponse.YES ? true : false,
          non_profit_description: x.nonProfitDescription,
          project_location: x.projectLocation,
          project_name: x.projectName,
          project_description: x.projectDescription,
          province: x.province,
          queue_priority: x.queuePriority,
          rental_units: x.rentalUnits?.toString(),
          single_family_units: x.singleFamilyUnits,
          multi_family_units: x.multiFamilyUnits,
          other_units: x.otherUnits,
          other_units_description: x.otherUnitsDescription,
          has_rental_units: x.hasRentalUnits,
          street_address: x.streetAddress,
          submitted_at: new Date(x.submittedAt ?? Date.now()),
          submitted_by: x.submittedBy as string
        }))
      });
    });
  },

  /**
   * @function deleteHousingProject
   * Deletes the housing project, followed by the associated activity
   * This action will cascade delete across all linked items
   * @param {string} housingProjectId Hosuing Project ID
   * @returns {Promise<HousingProject>} The result of running the delete operation
   */
  deleteHousingProject: async (housingProjectId: string) => {
    const response = await prisma.$transaction(async (trx) => {
      const del = await trx.housing_project.delete({
        where: {
          housing_project_id: housingProjectId
        },
        include: {
          activity: {
            include: {
              activity_contact: {
                include: {
                  contact: true
                }
              }
            }
          }
        }
      });

      await trx.activity.delete({
        where: {
          activity_id: del.activity_id
        }
      });

      return del;
    });

    return housing_project.fromPrismaModelWithContact(response);
  },

  /**
   * @function getFormExport
   * Gets a full data export for the requested CHEFS form
   * @param {string} formId CHEFS form id
   * @returns {Promise<any>} The result of running the get operation
   */
  getFormExport: async (formId: string) => {
    try {
      const response = await chefsAxios(formId).get(`forms/${formId}/export`, {
        params: { format: 'json', type: 'submissions' }
      });
      return response.data;
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function getStatistics
   * Gets a set of housing project related statistics
   * @returns {Promise<object>} The result of running the query
   */
  getStatistics: async (filters: { dateFrom: string; dateTo: string; monthYear: string; userId: string }) => {
    // Return a single quoted string or null for the given value
    const val = (value: unknown) => (value ? `'${value}'` : null);

    const date_from = val(filters.dateFrom);
    const date_to = val(filters.dateTo);
    const month_year = val(filters.monthYear);
    const user_id = filters.userId?.length ? filters.userId : null;

    /* eslint-disable max-len */
    const response =
      await prisma.$queryRaw`select * from get_activity_statistics(${date_from}, ${date_to}, ${month_year}, ${user_id}::uuid)`;
    /* eslint-enable max-len */

    // count() returns BigInt
    // JSON.stringify() doesn't know how to serialize BigInt
    // https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-521460510
    return JSON.parse(JSON.stringify(response, (_key, value) => (typeof value === 'bigint' ? Number(value) : value)));
  },

  /**
   * @function getHousingProject
   * Gets a specific housing project from the PCNS database
   * @param {string} housingProjectId PCNS housing project ID
   * @returns {Promise<HousingProject | null>} The result of running the findFirst operation
   */
  getHousingProject: async (housingProjectId: string) => {
    try {
      const result = await prisma.housing_project.findFirst({
        where: {
          housing_project_id: housingProjectId
        },
        include: {
          activity: {
            include: {
              activity_contact: {
                include: {
                  contact: true
                }
              }
            }
          }
        }
      });

      return result ? housing_project.fromPrismaModelWithContact(result) : null;
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function getHousingProjects
   * Gets a list of housing projects
   * @returns {Promise<(HousingProject | null)[]>} The result of running the findMany operation
   */
  getHousingProjects: async () => {
    try {
      const result = await prisma.housing_project.findMany({
        include: {
          activity: {
            include: {
              activity_contact: {
                include: {
                  contact: true
                }
              }
            }
          },
          user: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      return result.map((x) => housing_project.fromPrismaModelWithUser(x));
    } catch (e: unknown) {
      throw e;
    }
  },

  /* eslint-disable max-len */
  /**
   * @function searchHousingProjects
   * Search and filter for specific housing projects
   * @param {string[]} [params.activityId] Optional array of uuids representing the activity ID
   * @param {string[]} [params.createdBy] Optional array of uuids representing users who created housing projects
   * @param {string[]} [params.housingProjectId] Optional array of uuids representing the housing project ID
   * @param {string[]} [params.housingProjectType] Optional array of strings representing the housing project type
   * @param {string[]} [params.intakeStatus] Optional array of strings representing the intake status
   * @param {boolean}  [params.includeDeleted] Optional bool representing whether deleted housing projects should be included
   * @param {boolean}  [params.includeUser] Optional boolean representing whether the linked user should be included
   * @returns {Promise<(HousingProject | null)[]>} The result of running the findMany operation
   */
  /* eslint-enable max-len */
  searchHousingProjects: async (params: HousingProjectSearchParameters) => {
    let result = await prisma.housing_project.findMany({
      include: {
        activity: {
          include: {
            activity_contact: {
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
            activity_id: { in: params.activityId }
          },
          {
            created_by: { in: params.createdBy }
          },
          {
            housing_project_id: { in: params.housingProjectId }
          },
          {
            housing_project_type: { in: params.housingProjectType }
          },
          {
            intake_status: { in: params.intakeStatus }
          },
          params.includeDeleted ? {} : { activity: { is_deleted: false } }
        ]
      }
    });

    // Remove soft deleted housing projects
    if (!params.includeDeleted) result = result.filter((x) => !x.activity.is_deleted);

    const housingProjects = params.includeUser
      ? result.map((x) => housing_project.fromPrismaModelWithUser(x))
      : result.map((x) => housing_project.fromPrismaModelWithContact(x));

    return housingProjects;
  },

  /**
   * @function updateIsDeletedFlag
   * Updates is_deleted flag for the corresponding activity
   * @param {string} housingProjectId Housing project ID
   * @param {string} isDeleted flag
   * @returns {Promise<HousingProject>} The result of running the delete operation
   */
  updateIsDeletedFlag: async (housingProjectId: string, isDeleted: boolean, updateStamp: Partial<IStamps>) => {
    const deleteHousingProject = await prisma.housing_project.findUnique({
      where: {
        housing_project_id: housingProjectId
      },
      include: {
        activity: {
          include: {
            activity_contact: {
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
        data: { is_deleted: isDeleted, updated_at: updateStamp.updatedAt, updated_by: updateStamp.updatedBy },
        where: {
          activity_id: deleteHousingProject?.activity_id
        }
      });
      return housing_project.fromPrismaModelWithContact(deleteHousingProject);
    }
  },

  /**
   * @function updateHousingProject
   * Updates a specific housing project
   * @param {HousingProject} data Housing project to update
   * @returns {Promise<HousingProject | null>} The result of running the update operation
   */
  updateHousingProject: async (data: HousingProject) => {
    try {
      const s = housing_project.toPrismaModel(data);
      const result = await prisma.housing_project.update({
        data: {
          ...s,
          geo_json: s.geo_json as Prisma.InputJsonValue,
          updated_at: data.updatedAt,
          updated_by: data.updatedBy
        },
        where: {
          housing_project_id: data.housingProjectId
        },
        include: {
          activity: {
            include: {
              activity_contact: {
                include: {
                  contact: true
                }
              }
            }
          }
        }
      });
      return housing_project.fromPrismaModelWithContact(result);
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;

import { electrification_project } from '@prisma/client';
import prisma from '../db/dataConnection';

import type { IStamps } from '../interfaces/IStamps';
import type {
  ElectrificationProject,
  ElectrificationProjectBase,
  ElectrificationProjectSearchParameters
} from '../types';

const service = {
  /**
   * @function createElectrificationProject
   * Creates a new electrification project
   * @returns {Promise<Partial<ElectrificationProject>>} The result of running the transaction
   */
  createElectrificationProject: async (data: ElectrificationProjectBase): Promise<ElectrificationProject> => {
    const response = await prisma.electrification_project.create({
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
  },

  /**
   * @function getStatistics
   * Gets a set of electrification project related statistics
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
      await prisma.$queryRaw`select * from get_electrification_statistics(${date_from}, ${date_to}, ${month_year}, ${user_id}::uuid)`;
    /* eslint-enable max-len */

    // count() returns BigInt
    // JSON.stringify() doesn't know how to serialize BigInt
    // https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-521460510
    return JSON.parse(JSON.stringify(response, (_key, value) => (typeof value === 'bigint' ? Number(value) : value)));
  },

  /**
   * @function getElectrificationProject
   * Gets a specific electrification project from the PCNS database
   * @param {string} electrificationProjectId PCNS electrification project ID
   * @returns {Promise<ElectrificationProject | null>} The result of running the findFirst operation
   */
  getElectrificationProject: async (electrificationProjectId: string): Promise<ElectrificationProject> => {
    const result = await prisma.electrification_project.findFirstOrThrow({
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
  },

  /**
   * @function getElectrificationProjects
   * Gets a list of electrification projects
   * @param {boolean} [includeDeleted=false] Optional boolean to include deleted electrification projects
   * @returns {Promise<(ElectrificationProject | null)[]>} The result of running the findMany operation
   */
  getElectrificationProjects: async (includeDeleted: boolean = false): Promise<ElectrificationProject[]> => {
    const result = await prisma.electrification_project.findMany({
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
      },
      where: includeDeleted ? {} : { activity: { isDeleted: false } }
    });

    return result;
  },

  /* eslint-disable max-len */
  /**
   * @function searchElectrificationProjects
   * Search and filter for specific electrification projects
   * @param {string[]} [params.activityId] Optional array of uuids representing the activity ID
   * @param {string[]} [params.createdBy] Optional array of uuids representing users who created electrification projects
   * @param {string[]} [params.electrificationProjectId] Optional array of uuids representing the electrification project ID
   * @param {string[]} [params.projectType] Optional array of strings representing the electrification project type
   * @param {string[]} [params.projectCategory] Optional array of strings representing the electrification project category
   * @param {string[]} [params.intakeStatus] Optional array of strings representing the intake status
   * @param {boolean}  [params.includeDeleted] Optional bool representing whether deleted electrification projects should be included
   * @param {boolean}  [params.includeUser] Optional boolean representing whether the linked user should be included
   * @returns {Promise<(ElectrificationProject | null)[]>} The result of running the findMany operation
   */
  /* eslint-enable max-len */
  searchElectrificationProjects: async (
    params: ElectrificationProjectSearchParameters
  ): Promise<ElectrificationProject[]> => {
    let result = await prisma.electrification_project.findMany({
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
            electrificationProjectId: { in: params.electrificationProjectId }
          },
          {
            projectType: { in: params.projectType }
          },
          {
            projectCategory: { in: params.projectCategory }
          },
          {
            intakeStatus: { in: params.intakeStatus }
          },
          params.includeDeleted ? {} : { activity: { isDeleted: false } }
        ]
      }
    });

    // Remove soft deleted electrification projects
    if (!params.includeDeleted) result = result.filter((x) => !x.activity.isDeleted);

    return result;
  },

  /**
   * @function updateIsDeletedFlag
   * Updates is_deleted flag for the corresponding activity
   * @param {string} electrificationProjectId Electrification project ID
   * @param {string} isDeleted flag
   * @returns {Promise<ElectrificationProject>} The result of running the delete operation
   */
  updateIsDeletedFlag: async (
    electrificationProjectId: string,
    isDeleted: boolean,
    updateStamp: Partial<IStamps>
  ): Promise<ElectrificationProject> => {
    const deleteElectrificationProject = await prisma.electrification_project.findUniqueOrThrow({
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

    if (deleteElectrificationProject) {
      await prisma.activity.update({
        data: { isDeleted: isDeleted, updatedAt: updateStamp.updatedAt, updatedBy: updateStamp.updatedBy },
        where: {
          activityId: deleteElectrificationProject?.activityId
        }
      });
    }

    return deleteElectrificationProject;
  },

  /**
   * @function updateElectrificationProject
   * Updates a specific electrification project
   * @param {ElectrificationProject} data Electrification project to update
   * @returns {Promise<ElectrificationProject | null>} The result of running the update operation
   */
  updateElectrificationProject: async (data: ElectrificationProjectBase): Promise<ElectrificationProject> => {
    const result = await prisma.electrification_project.update({
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
  }
};

export default service;

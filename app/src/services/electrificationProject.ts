/* eslint-disable no-useless-catch */
import prisma from '../db/dataConnection';
import { electrification_project } from '../db/models';

import type { IStamps } from '../interfaces/IStamps';
import type { ElectrificationProject, ElectrificationProjectSearchParameters } from '../types';

const service = {
  /**
   * @function createElectrificationProject
   * Creates a new electrification project
   * @returns {Promise<Partial<ElectrificationProject>>} The result of running the transaction
   */
  createElectrificationProject: async (data: ElectrificationProject) => {
    const response = await prisma.electrification_project.create({
      data: data,
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
    return electrification_project.fromPrismaModelWithContact(response);
  },

  /**
   * @function deleteElectrificationProject
   * Deletes the electrification project, followed by the associated activity
   * This action will cascade delete across all linked items
   * @param {string} electrificationProjectId Hosuing Project ID
   * @returns {Promise<ElectrificationProject>} The result of running the delete operation
   */
  deleteElectrificationProject: async (electrificationProjectId: string) => {
    const response = await prisma.$transaction(async (trx) => {
      const del = await trx.electrification_project.delete({
        where: {
          electrificationProjectId: electrificationProjectId
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
          activity_id: del.activityId
        }
      });

      return del;
    });

    return electrification_project.fromPrismaModelWithContact(response);
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
  getElectrificationProject: async (electrificationProjectId: string) => {
    try {
      const result = await prisma.electrification_project.findFirst({
        where: {
          electrificationProjectId: electrificationProjectId
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

      return result ? electrification_project.fromPrismaModelWithContact(result) : null;
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function getElectrificationProjects
   * Gets a list of electrification projects
   * @returns {Promise<(ElectrificationProject | null)[]>} The result of running the findMany operation
   */
  getElectrificationProjects: async () => {
    try {
      const result = await prisma.electrification_project.findMany({
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
          createdAt: 'desc'
        }
      });

      return result.map((x) => electrification_project.fromPrismaModelWithUser(x));
    } catch (e: unknown) {
      throw e;
    }
  },

  /* eslint-disable max-len */
  /**
   * @function searchElectrificationProjects
   * Search and filter for specific electrification projects
   * @param {string[]} [params.activityId] Optional array of uuids representing the activity ID
   * @param {string[]} [params.createdBy] Optional array of uuids representing users who created electrification projects
   * @param {string[]} [params.electrificationProjectId] Optional array of uuids representing the electrification project ID
   * @param {string[]} [params.submissionType] Optional array of strings representing the electrification submission type
   * @param {string[]} [params.intakeStatus] Optional array of strings representing the intake status
   * @param {boolean}  [params.includeDeleted] Optional bool representing whether deleted electrification projects should be included
   * @param {boolean}  [params.includeUser] Optional boolean representing whether the linked user should be included
   * @returns {Promise<(ElectrificationProject | null)[]>} The result of running the findMany operation
   */
  /* eslint-enable max-len */
  searchElectrificationProjects: async (params: ElectrificationProjectSearchParameters) => {
    let result = await prisma.electrification_project.findMany({
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
            activityId: { in: params.activityId }
          },
          {
            createdBy: { in: params.createdBy }
          },
          {
            electrificationProjectId: { in: params.electrificationProjectId }
          },
          {
            submissionType: { in: params.submissionType }
          },
          {
            intakeStatus: { in: params.intakeStatus }
          },
          params.includeDeleted ? {} : { activity: { is_deleted: false } }
        ]
      }
    });

    // Remove soft deleted electrification projects
    if (!params.includeDeleted) result = result.filter((x) => !x.activity.is_deleted);

    const electrificationProjects = params.includeUser
      ? result.map((x) => electrification_project.fromPrismaModelWithUser(x))
      : result.map((x) => electrification_project.fromPrismaModelWithContact(x));

    return electrificationProjects;
  },

  /**
   * @function updateIsDeletedFlag
   * Updates is_deleted flag for the corresponding activity
   * @param {string} electrificationProjectId Electrification project ID
   * @param {string} isDeleted flag
   * @returns {Promise<ElectrificationProject>} The result of running the delete operation
   */
  updateIsDeletedFlag: async (electrificationProjectId: string, isDeleted: boolean, updateStamp: Partial<IStamps>) => {
    const deleteElectrificationProject = await prisma.electrification_project.findUnique({
      where: {
        electrificationProjectId: electrificationProjectId
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

    if (deleteElectrificationProject) {
      await prisma.activity.update({
        data: { is_deleted: isDeleted, updated_at: updateStamp.updatedAt, updated_by: updateStamp.updatedBy },
        where: {
          activity_id: deleteElectrificationProject?.activityId
        }
      });

      return electrification_project.fromPrismaModelWithContact(deleteElectrificationProject);
    }
  },

  /**
   * @function updateElectrificationProject
   * Updates a specific electrification project
   * @param {ElectrificationProject} data Electrification project to update
   * @returns {Promise<ElectrificationProject | null>} The result of running the update operation
   */
  updateElectrificationProject: async (data: ElectrificationProject) => {
    try {
      const result = await prisma.electrification_project.update({
        data: data,
        where: {
          electrificationProjectId: data.electrificationProjectId
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
      return electrification_project.fromPrismaModelWithContact(result);
    } catch (e: unknown) {
      throw e;
    }
  }
};

export default service;

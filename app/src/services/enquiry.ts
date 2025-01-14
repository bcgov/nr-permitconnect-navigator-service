/* eslint-disable no-useless-catch */
import prisma from '../db/dataConnection.ts';
import { enquiry } from '../db/models.ts';
import { IStamps } from '../interfaces/IStamps.ts';

import type { Enquiry, EnquirySearchParameters } from '../types.ts';

const service = {
  /**
   * @function createEnquiry
   * Creates a new enquiry
   * @returns {Promise<Partial<Enquiry>>} The result of running the transaction
   */
  createEnquiry: async (data: Partial<Enquiry>) => {
    const response = await prisma.enquiry.create({
      data: { ...enquiry.toPrismaModel(data as Enquiry), created_at: data.createdAt, created_by: data.createdBy },
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

    return enquiry.fromPrismaModelWithContact(response);
  },

  /**
   * @function deleteEnquiry
   * Deletes the enquiry, followed by the associated activity
   * This action will cascade delete across all linked items
   * @param {string} enquiryId Enquiry ID
   * @returns {Promise<Enquiry>} The result of running the delete operation
   */
  deleteEnquiry: async (enquiryId: string) => {
    const response = await prisma.$transaction(async (trx) => {
      const del = await trx.enquiry.delete({
        where: {
          enquiry_id: enquiryId
        }
      });

      await trx.activity.delete({
        where: {
          activity_id: del.activity_id
        }
      });

      return del;
    });

    return enquiry.fromPrismaModel(response);
  },

  /**
   * @function getEnquiries
   * Gets a list of enquiries
   * @returns {Promise<(Enquiry | null)[]>} The result of running the findMany operation
   */
  getEnquiries: async () => {
    try {
      // fetch all enquiries with activity not deleted
      const result = await prisma.enquiry.findMany({
        where: {
          activity: {
            is_deleted: false
          }
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
          },
          user: true
        }
      });

      return result.map((x) => enquiry.fromPrismaModelWithUser(x));
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function getEnquiry
   * Gets a specific enquiry from the PCNS database
   * @param {string} enquiryId Enquiry ID
   * @returns {Promise<Enquiry | null>} The result of running the findFirst operation
   */
  getEnquiry: async (enquiryId: string) => {
    try {
      const result = await prisma.enquiry.findFirst({
        where: {
          enquiry_id: enquiryId
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

      return result ? enquiry.fromPrismaModelWithContact(result) : null;
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function searchEnquiries
   * Search and filter for specific submission
   * @param {string[]} [params.activityId] Optional array of uuids representing the activity ID
   * @param {string[]} [params.enquiry_id] Optional array of uuids representing the enquiry ID
   * @param {string[]} [params.intakeStatus] Optional array of strings representing the intake status
   * @param {boolean}  [params.includeUser] Optional boolean representing whether the linked user should be included
   * @returns {Promise<(Submission | null)[]>} The result of running the findMany operation
   */
  searchEnquiries: async (params: EnquirySearchParameters) => {
    try {
      const result = await prisma.enquiry.findMany({
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
              enquiry_id: { in: params.enquiryId }
            },
            {
              intake_status: { in: params.intakeStatus }
            }
          ]
        }
      });

      const enquiries = params.includeUser
        ? result.map((x) => enquiry.fromPrismaModelWithUser(x))
        : result.map((x) => enquiry.fromPrismaModelWithContact(x));

      return enquiries;
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function getRelatedEnquiries
   * Gets list of enquiries related to the given activityId
   * @param {string} activityId Activity ID
   * @returns {Promise<Enquiry | null>} The result of running the findFirst operation
   */
  getRelatedEnquiries: async (activityId: string) => {
    try {
      const result = await prisma.enquiry.findMany({
        where: {
          related_activity_id: activityId
        },
        orderBy: {
          created_at: 'asc'
        }
      });

      return result.map((x) => enquiry.fromPrismaModel(x));
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function updateEnquiry
   * Updates a specific enquiry
   * @param {Enquiry} data Enquiry to update
   * @returns {Promise<Enquiry | null>} The result of running the update operation
   */
  updateEnquiry: async (data: Enquiry) => {
    try {
      const result = await prisma.enquiry.update({
        data: { ...enquiry.toPrismaModel(data), updated_at: data.updatedAt, updated_by: data.updatedBy },
        where: {
          enquiry_id: data.enquiryId
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

      return enquiry.fromPrismaModelWithContact(result);
    } catch (e: unknown) {
      throw e;
    }
  },

  /**
   * @function updateIsDeletedFlag
   * Updates is_deleted flag for the corresponding activity
   * @param {string} enquiryId Enquiry ID
   * @param {string} isDeleted flag
   * @returns {Promise<Enquiry>} The result of running the delete operation
   */
  updateIsDeletedFlag: async (enquiryId: string, isDeleted: boolean, updateStamp: Partial<IStamps>) => {
    const deleteEnquiry = await prisma.enquiry.findUnique({
      where: {
        enquiry_id: enquiryId
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
    if (deleteEnquiry) {
      await prisma.activity.update({
        data: { is_deleted: isDeleted, updated_at: updateStamp.updatedAt, updated_by: updateStamp.updatedBy },
        where: {
          activity_id: deleteEnquiry.activity_id
        }
      });
      return enquiry.fromPrismaModelWithContact(deleteEnquiry);
    }
  }
};

export default service;

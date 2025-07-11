import prisma from '../db/dataConnection';
import { IStamps } from '../interfaces/IStamps';
import { Initiative } from '../utils/enums/application';

import type { Enquiry, EnquirySearchParameters } from '../types';

const service = {
  /**
   * @function createEnquiry
   * Creates a new enquiry
   * @returns {Promise<Partial<Enquiry>>} The result of running the transaction
   */
  createEnquiry: async (data: Partial<Enquiry>) => {
    const response = await prisma.enquiry.create({
      data: { ...enquiry.toPrismaModel(data as Enquiry), createdAt: data.createdAt, createdBy: data.createdBy },
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
          enquiryId
        }
      });

      await trx.activity.delete({
        where: {
          activityId: del.activityId
        }
      });

      return del;
    });

    return response;
  },

  /**
   * @function getEnquiries
   * Gets a list of enquiries
   * @returns {Promise<(Enquiry | null)[]>} The result of running the findMany operation
   */
  getEnquiries: async () => {
    // fetch all enquiries with activity not deleted
    const result = await prisma.enquiry.findMany({
      where: {
        activity: {
          isDeleted: false
        }
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
        },
        user: true
      }
    });

    return result;
  },

  /**
   * @function getEnquiry
   * Gets a specific enquiry from the PCNS database
   * @param {string} enquiryId Enquiry ID
   * @returns {Promise<Enquiry | null>} The result of running the findFirst operation
   */
  getEnquiry: async (enquiryId: string) => {
    const result = await prisma.enquiry.findFirst({
      where: {
        enquiryId: enquiryId
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
   * @function searchEnquiries
   * Search and filter for specific enquiries
   * @param {string[]} [params.activityId] Optional array of uuids representing the activity ID
   * @param {string[]} [params.createdBy] Optional array of uuids representing users who created enquiries
   * @param {string[]} [params.enquiryId] Optional array of uuids representing the enquiry ID
   * @param {string[]} [params.intakeStatus] Optional array of strings representing the intake status
   * @param {boolean}  [params.includeDeleted] Optional bool representing if deleted enquiries should be included
   * @param {boolean}  [params.includeUser] Optional boolean representing whether the linked user should be included
   * @param {Initiative} [initiative] Initiative to search in
   * @returns {Promise<(Submission | null)[]>} The result of running the findMany operation
   */
  searchEnquiries: async (params: EnquirySearchParameters, initiative: Initiative) => {
    const result = await prisma.enquiry.findMany({
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            },
            initiative: true
          }
        },
        user: params.includeUser
      },
      where: {
        AND: [
          {
            activity: {
              initiative: {
                code: initiative
              }
            }
          },
          {
            activityId: { in: params.activityId }
          },
          {
            createdBy: { in: params.createdBy }
          },
          {
            enquiryId: { in: params.enquiryId }
          },
          {
            intakeStatus: { in: params.intakeStatus }
          },
          params.includeDeleted ? {} : { activity: { isDeleted: false } }
        ]
      }
    });

    return result;
  },

  /**
   * @function getRelatedEnquiries
   * Gets list of enquiries related to the given activityId
   * @param {string} activityId Activity ID
   * @returns {Promise<Enquiry | null>} The result of running the findFirst operation
   */
  getRelatedEnquiries: async (activityId: string) => {
    const result = await prisma.enquiry.findMany({
      where: {
        relatedActivityId: activityId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return result;
  },

  /**
   * @function updateEnquiry
   * Updates a specific enquiry
   * @param {Enquiry} data Enquiry to update
   * @returns {Promise<Enquiry | null>} The result of running the update operation
   */
  updateEnquiry: async (data: Enquiry) => {
    const result = await prisma.enquiry.update({
      data: data,
      where: {
        enquiryId: data.enquiryId
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
   * @function updateIsDeletedFlag
   * Updates is_deleted flag for the corresponding activity
   * @param {string} enquiryId Enquiry ID
   * @param {string} isDeleted flag
   * @returns {Promise<Enquiry>} The result of running the delete operation
   */
  updateIsDeletedFlag: async (enquiryId: string, isDeleted: boolean, updateStamp: Partial<IStamps>) => {
    const deleteEnquiry = await prisma.enquiry.findUnique({
      where: {
        enquiryId: enquiryId
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
    if (deleteEnquiry) {
      await prisma.activity.update({
        data: { isDeleted: isDeleted, updatedAt: updateStamp.updatedAt, updatedBy: updateStamp.updatedBy },
        where: {
          activityId: deleteEnquiry.activityId
        }
      });
      return deleteEnquiry;
    }
  }
};

export default service;

import prisma from '../db/dataConnection';
import { Initiative } from '../utils/enums/application';

import type { PrismaTransactionClient } from '../db/dataConnection';
import type { IStamps } from '../interfaces/IStamps';
import type { Enquiry, EnquiryBase, EnquirySearchParameters } from '../types';

/**
 * Creates a new enquiry
 * @param tx Prisma transaction client
 * @param data The enquiry data to create
 * @returns A Promise that resolves to the created enquiry
 */
export const createEnquiry = async (tx: PrismaTransactionClient, data: EnquiryBase): Promise<Enquiry> => {
  const response = await tx.enquiry.create({
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
};

/**
 * Gets a list of enquiries
 * @param tx Prisma transaction client
 * @returns A Promise that resolves to an array of enquiries
 */
export const getEnquiries = async (tx: PrismaTransactionClient): Promise<Enquiry[]> => {
  // fetch all enquiries with activity not deleted
  const result = await tx.enquiry.findMany({
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
};

/**
 * Gets a specific enquiry from the PCNS database
 * @param tx Prisma transaction client
 * @param enquiryId Enquiry ID
 * @returns A Promise that resolves into the specific enquiry
 */
export const getEnquiry = async (tx: PrismaTransactionClient, enquiryId: string): Promise<Enquiry> => {
  const result = await tx.enquiry.findFirstOrThrow({
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
};

/**
 * @function searchEnquiries
 * Search and filter for specific enquiries
 * @param tx Prisma transaction client
 * @param params.activityId Optional array of uuids representing the activity ID
 * @param params.createdBy Optional array of uuids representing users who created enquiries
 * @param params.enquiryId Optional array of uuids representing the enquiry ID
 * @param params.intakeStatus Optional array of strings representing the intake status
 * @param params.includeUser Optional boolean representing whether the linked user should be included
 * @param initiative Initiative to search in
 * @returns A Promise that resolves to an array of enquiries from search params
 */
export const searchEnquiries = async (
  tx: PrismaTransactionClient,
  params: EnquirySearchParameters,
  initiative: Initiative
): Promise<Enquiry[]> => {
  const result = await tx.enquiry.findMany({
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
        }
      ]
    }
  });

  return result;
};

/**
 * Gets a list of enquiries related to the given activityId
 * @param tx Prisma transaction client
 * @param activityId Activity ID
 * @returns A Promise that resolves to an array of related enquiries
 */
export const getRelatedEnquiries = async (tx: PrismaTransactionClient, activityId: string): Promise<Enquiry[]> => {
  const result = await tx.enquiry.findMany({
    where: {
      relatedActivityId: activityId
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return result;
};

/**
 * Updates a specific enquiry
 * @param tx Prisma transaction client
 * @param data Enquiry to update
 * @returns A Promise that resolves to the updated enquiry
 */
export const updateEnquiry = async (tx: PrismaTransactionClient, data: EnquiryBase): Promise<Enquiry> => {
  const result = await tx.enquiry.update({
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
};

/**
 * Updates is_deleted flag for the corresponding activity
 * @param tx Prisma transaction client
 * @param enquiryId Enquiry ID
 * @param isDeleted flag
 * @returns A Promise that resolves to the enquiry with the updated flag
 */
export const updateEnquiryIsDeletedFlag = async (
  tx: PrismaTransactionClient,
  enquiryId: string,
  isDeleted: boolean,
  updateStamp: Partial<IStamps>
): Promise<Enquiry> => {
  // TODO-PR: Remove this service function, move project search up to controller layer
  // and add "correct" service calls to controller layer
  const deleteEnquiry = await tx.enquiry.findUniqueOrThrow({
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
  }

  return deleteEnquiry;
};

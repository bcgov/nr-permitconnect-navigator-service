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
 * Delete an enquiry
 * @param tx Prisma transaction client
 * @param enquiryId Unique enquiry ID
 * @param deleteStamp Timestamp information of the delete
 */
export const deleteEnquiry = async (
  tx: PrismaTransactionClient,
  enquiryId: string,
  deleteStamp: Partial<IStamps>
): Promise<void> => {
  await tx.enquiry.update({
    data: { deletedAt: deleteStamp.deletedAt, deletedBy: deleteStamp.deletedBy },
    where: { enquiryId }
  });
};

/**
 * Gets a list of enquiries
 * @param tx Prisma transaction client
 * @returns A Promise that resolves to an array of enquiries
 */
export const getEnquiries = async (tx: PrismaTransactionClient): Promise<Enquiry[]> => {
  // fetch all enquiries with activity not deleted
  const result = await tx.enquiry.findMany({
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
 * Search and filter for specific enquiries
 * @param tx Prisma transaction client
 * @param params.activityId Optional array of uuids representing the activity ID
 * @param params.createdBy Optional array of uuids representing users who created enquiries
 * @param params.enquiryId Optional array of uuids representing the enquiry ID
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
    where: {
      AND: [
        {
          activity: {
            initiative: {
              code: initiative !== Initiative.PCNS ? initiative : undefined
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
        }
      ]
    },
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

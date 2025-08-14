import { v4 as uuidv4 } from 'uuid';

import { AccessRequestStatus, Initiative } from '../utils/enums/application';

import type { PrismaTransactionClient } from '../db/dataConnection';
import type { AccessRequest, AccessRequestBase } from '../types';

/**
 * Create an access request record
 * @param tx Prisma transaction client
 * @param accessRequest - The access request object to create
 * @returns A Promise that resolves to the created resource
 */
export const createUserAccessRequest = async (
  tx: PrismaTransactionClient,
  accessRequest: AccessRequestBase
): Promise<AccessRequest> => {
  const newAccessRequest = {
    accessRequestId: uuidv4(),
    userId: accessRequest.userId,
    grant: accessRequest.grant,
    groupId: accessRequest.groupId,
    status: AccessRequestStatus.PENDING
  };

  const accessRequestResponse = await tx.access_request.create({
    data: newAccessRequest,
    include: {
      group: true
    }
  });

  return accessRequestResponse;
};

/**
 * Get an access request
 * @param tx Prisma transaction client
 * @param initiative - The initiative for which the access request belongs to
 * @param accessRequestId - The ID of the access request to retrieve
 * @returns A Promise that resolves to the access request for the given parameters
 */
export const getAccessRequest = async (
  tx: PrismaTransactionClient,
  initiative: Initiative,
  accessRequestId: string
): Promise<AccessRequest> => {
  const response = await tx.access_request.findUniqueOrThrow({
    where: {
      accessRequestId: accessRequestId,
      group: {
        initiative: {
          code: initiative
        }
      }
    },
    include: {
      group: true
    }
  });

  return response;
};

/**
 * Retrieve all access requests
 * @param tx Prisma transaction client
 * @param initiative - The initiative for which the access requests belongs to
 * @returns A Promise that resolves to the access requests matching the given options
 */
export const getAccessRequests = async (
  tx: PrismaTransactionClient,
  initiative: Initiative
): Promise<AccessRequest[]> => {
  const response = await tx.access_request.findMany({
    where: {
      group: {
        initiative: {
          code: initiative
        }
      }
    },
    include: {
      group: true
    }
  });

  return response;
};

/**
 * Update an access request
 * @param tx Prisma transaction client
 * @param data - The access request object to update
 * @returns A Promise that resolves to the updated resource
 */
export const updateAccessRequest = async (
  tx: PrismaTransactionClient,
  data: AccessRequestBase
): Promise<AccessRequest> => {
  const result = await tx.access_request.update({
    data: { ...data, updatedAt: data.updatedAt, updatedBy: data.updatedBy },
    where: {
      accessRequestId: data.accessRequestId
    },
    include: {
      group: true
    }
  });

  return result;
};

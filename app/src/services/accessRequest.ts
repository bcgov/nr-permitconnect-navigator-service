// import jwt from 'jsonwebtoken';
// import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import prisma from '../db/dataConnection';
import { access_request } from '../db/models';
import { AccessRequestStatus } from '../utils/enums/application';

import type { AccessRequest } from '../types';

/**
 * The User DB Service
 */
const service = {
  /**
   * @function createUserAccessRequest
   * Create an access_request record
   * @param {object} data Incoming accessRequest data
   * @returns {Promise<object>} The result of running the insert operation
   * @throws The error encountered upon db transaction failure
   */
  createUserAccessRevokeRequest: async (accessRequest: AccessRequest) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    const newAccessRequest = {
      accessRequestId: uuidv4(),
      userId: accessRequest.userId,
      grant: accessRequest.grant as boolean,
      role: accessRequest.role as string,
      status: AccessRequestStatus.PENDING
    };
    const accessRequestResponse = await prisma.access_request.create({
      data: access_request.toPrismaModel(newAccessRequest)
    });

    return access_request.fromPrismaModel(accessRequestResponse);
  },

  /**
   * @function getAccessRequests
   * Get all access requests
   * @returns {Promise<object>} The result of running the find operation
   */
  getAccessRequests: async () => {
    const response = await prisma.access_request.findMany();
    return response.map((x) => access_request.fromPrismaModel(x));
  },

  /**
   * @function updateUserRole
   * Updates user role
   * @returns {Promise<object>} The result of running the put operation
   */
  updateUserRole: async () => {
    // TODO: Implement updateUserRole
  }
};

export default service;

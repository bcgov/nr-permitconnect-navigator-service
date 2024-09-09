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
   * Create an access request record
   * @param {object} accessRequest Incoming access request data
   * @returns {Promise<object>} The result of running the insert operation
   * @throws The error encountered upon db transaction failure
   */
  createUserAccessRequest: async (accessRequest: AccessRequest) => {
    const newAccessRequest = {
      accessRequestId: uuidv4(),
      userId: accessRequest.userId,
      grant: accessRequest.grant,
      group: accessRequest.group,
      status: AccessRequestStatus.PENDING
    };

    const accessRequestResponse = await prisma.access_request.create({
      data: access_request.toPrismaModel(newAccessRequest)
    });

    return access_request.fromPrismaModel(accessRequestResponse);
  },

  /**
   * @function deleteAccessRequests
   * Deletes the access request
   * @returns {Promise<object>} The result of running the delete operation
   */
  deleteAccessRequest: async (accessRequestId: string) => {
    const response = await prisma.access_request.delete({
      where: {
        access_request_id: accessRequestId
      }
    });
    return access_request.fromPrismaModel(response);
  },

  /**
   * @function getAccessRequest
   * Get an access request
   * @param {string} accessRequestId The access request data to retrieve
   * @returns {Promise<object>} The result of running the find operation
   */
  getAccessRequest: async (accessRequestId: string) => {
    const response = await prisma.access_request.findUnique({
      where: {
        access_request_id: accessRequestId
      }
    });
    return response ? access_request.fromPrismaModel(response) : null;
  },

  /**
   * @function getAccessRequests
   * Get all access requests
   * @returns {Promise<object>} The result of running the find operation
   */
  getAccessRequests: async () => {
    const response = await prisma.access_request.findMany();
    return response.map((x) => access_request.fromPrismaModel(x));
  }
};

export default service;

import { v4 as uuidv4 } from 'uuid';

import prisma from '../db/dataConnection';
import { access_request } from '../db/models';
import { AccessRequestStatus, Initiative } from '../utils/enums/application';

import type { AccessRequest } from '../types';

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
      groupId: accessRequest.groupId,
      status: AccessRequestStatus.PENDING
    };

    const accessRequestResponse = await prisma.access_request.create({
      data: access_request.toPrismaModel(newAccessRequest)
    });

    return access_request.fromPrismaModel(accessRequestResponse);
  },

  /**
   * @function getAccessRequest
   * Get an access request
   * @param {string} accessRequestId The access request data to retrieve
   * @returns {Promise<object>} The result of running the find operation
   */
  getAccessRequest: async (initiative: Initiative, accessRequestId: string) => {
    const response = await prisma.access_request.findUnique({
      where: {
        access_request_id: accessRequestId,
        group: {
          initiative: {
            code: initiative
          }
        }
      }
    });
    return response ? access_request.fromPrismaModel(response) : null;
  },

  /**
   * @function getAccessRequests
   * Get all access requests
   * @returns {Promise<object>} The result of running the find operation
   */
  getAccessRequests: async (initiative: Initiative) => {
    const response = await prisma.access_request.findMany({
      where: {
        group: {
          initiative: {
            code: initiative
          }
        }
      }
    });
    return response.map((x) => access_request.fromPrismaModel(x));
  },

  /**
   * @function updateAccessRequest
   * Updates a specific enquiry
   * @param {Enquiry} data Enquiry to update
   * @returns {Promise<Enquiry | null>} The result of running the update operation
   */
  updateAccessRequest: async (data: AccessRequest) => {
    const result = await prisma.access_request.update({
      data: { ...access_request.toPrismaModel(data), updated_at: data.updatedAt, updated_by: data.updatedBy },
      where: {
        access_request_id: data.accessRequestId
      }
    });

    return access_request.fromPrismaModel(result);
  }
};

export default service;

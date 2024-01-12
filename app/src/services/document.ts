import axios from 'axios';
import config from 'config';

import { Prisma } from '@prisma/client';
import { v4, NIL } from 'uuid';

import prisma from '../db/dataConnection';
import { document } from '../db/models';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';

// /**
//  * @function comsAxios
//  * Returns an Axios instance for the COMS API
//  * @param {AxiosRequestConfig} options Axios request config options
//  * @returns {AxiosInstance} An axios instance
//  */
// // TODO: swap out formId
// function comsAxios(formId: string, options: AxiosRequestConfig = {}): AxiosInstance {
//   return axios.create({
//     baseURL: config.get('server.chefs.apiPath'),
//     timeout: 10000,
//     // TODO: swap out CHEFS API key for Pathfinder SSO user JWT
//     auth: { username: formId, password: getChefsApiKey(formId) ?? '' },
//     ...options
//   });
// }

const service = {
  /**
   * @function createDocumentEntry
   * "Adds" a document to a submission by linking a COMS object to the coresponding submission.
   * @param comsId coms-id for an existing COMS object
   * @param submissionId submissionId for the submission to be added to
   */
  createDocumentEntry: async (
    submissionId: string,
    comsId: string,
    filename: string,
    mimeType: string,
    filesize: bigint
  ) => {
    // client uploads file to COMS first
    // the client then gives us the coms-id (that + JWT is all we need to access the file)

    // Create record in PCNS DB
    await prisma.document.create({
      data: {
        documentId: comsId,
        submissionId: submissionId,
        filename: filename,
        mimeType: mimeType,
        filesize: filesize
      }
    });
  },

  /**
   * @function getDocuments
   * Retrieve a list of documents associated with a given submission
   * @param submissionId  PCNS submissionId
   * @returns   list of documents associated associated with the submission
   */
  getDocuments: async (submissionId: string) => {
    const response = await prisma.document.findMany({
      where: {
        submissionId: submissionId
      }
    });

    return response.map((x) => document.fromPrismaModel(x));
  }
};

export default service;

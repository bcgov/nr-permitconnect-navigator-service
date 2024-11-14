import prisma from '../db/dataConnection';
import { submission_draft } from '../db/models';

import type { SubmissionDraft } from '../types';

const service = {
  /**
   * @function createDraft
   * Create a submission draft
   * @param {SubmissionDraft} data Submission draft data
   * @returns {Promise<{submissionDraftId: string }>} The result of running the create operation
   */
  createDraft: async (data: SubmissionDraft) => {
    const response = await prisma.submission_draft.create({
      data: {
        submission_draft_id: data.submissionDraftId as string,
        data: data.data,
        created_at: data.createdAt,
        created_by: data.createdBy
      }
    });

    return { submissionDraftId: response.submission_draft_id };
  },

  /**
   * @function deleteDraft
   * Deletes the submission draft
   * @param {string} submissionDraftId Submission ID
   * @returns {Promise<Submission>} The result of running the delete operation
   */
  deleteDraft: async (submissionDraftId: string) => {
    const result = await prisma.submission_draft.delete({
      where: {
        submission_draft_id: submissionDraftId
      }
    });

    return result ? submission_draft.fromPrismaModel(result) : null;
  },

  /**
   * @function getDraft
   * Gets a specific submission draft from the PCNS database
   * @param {string} submissionDraftId Submission draft ID
   * @returns {Promise<Partial<SubmissionIntakeDraft> | null>} The result of running the findFirst operation
   */
  getDraft: async (submissionDraftId: string) => {
    const result = await prisma.submission_draft.findFirst({
      where: {
        submission_draft_id: submissionDraftId
      }
    });

    return result ? submission_draft.fromPrismaModel(result) : null;
  },

  /**
   * @function getDrafts
   * Gets a list of submission drafts
   * @returns {Promise<Partial<SubmissionIntakeDraft>[]>} The result of running the findMany operation
   */
  getDrafts: async () => {
    const result = await prisma.submission_draft.findMany();

    return result.map((x) => submission_draft.fromPrismaModel(x));
  },

  /**
   * @function updateDraft
   * Updates a specific submission draft
   * @param {SubmissionDraft} data Submission intake draft data
   * @returns {Promise<void>} The result of running the update operation
   */
  updateDraft: async (data: SubmissionDraft) => {
    const response = await prisma.submission_draft.update({
      data: { data: data.data, updated_at: data?.updatedAt, updated_by: data?.updatedBy },
      where: {
        submission_draft_id: data.submissionDraftId
      }
    });

    return { submissionDraftId: response.submission_draft_id };
  }
};

export default service;

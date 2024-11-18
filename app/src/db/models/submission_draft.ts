import { Prisma } from '@prisma/client';

import type { SubmissionDraft, SubmissionIntake } from '../../types';

// Define types
const _submissionDraft = Prisma.validator<Prisma.submission_draftDefaultArgs>()({});

type PrismaGraphSubmissionDraft = Prisma.submission_draftGetPayload<typeof _submissionDraft>;

export default {
  fromPrismaModel(input: PrismaGraphSubmissionDraft): SubmissionDraft {
    return {
      submissionDraftId: input.submission_draft_id,
      activityId: input.activity_id,
      data: input.data as Partial<SubmissionIntake>,
      createdBy: input.created_by,
      updatedAt: input.updated_at?.toISOString() ?? null
    };
  }
};

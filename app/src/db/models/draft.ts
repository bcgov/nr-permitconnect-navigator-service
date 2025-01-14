import { Prisma } from '@prisma/client';

import type { Draft } from '../../types/index.ts';

// Define types
const _draft = Prisma.validator<Prisma.draftDefaultArgs>()({});

type PrismaGraphDraft = Prisma.draftGetPayload<typeof _draft>;

export default {
  fromPrismaModel(input: PrismaGraphDraft): Draft {
    return {
      draftId: input.draft_id,
      activityId: input.activity_id,
      draftCode: input.draft_code,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: input.data as any,
      createdBy: input.created_by,
      updatedAt: input.updated_at?.toISOString() ?? null
    };
  }
};

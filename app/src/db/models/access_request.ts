import { Prisma } from '@prisma/client';

import { AccessRequestStatus } from '../../utils/enums/application';

import type { Stamps } from '../stamps';
import type { AccessRequest } from '../../types/AccessRequest';

// Define types
const _accessRequest = Prisma.validator<Prisma.access_requestDefaultArgs>()({});
const _accessRequestWithGraph = Prisma.validator<Prisma.access_requestDefaultArgs>()({});

type PrismaRelationAccessRequest = Omit<Prisma.access_requestGetPayload<typeof _accessRequest>, keyof Stamps>;
type PrismaGraphAccessRequest = Prisma.access_requestGetPayload<typeof _accessRequestWithGraph>;

export default {
  toPrismaModel(input: AccessRequest): PrismaRelationAccessRequest {
    return {
      access_request_id: input.accessRequestId,
      grant: input.grant,
      group_id: input.groupId,
      status: input.status as AccessRequestStatus,
      user_id: input.userId as string
    };
  },

  fromPrismaModel(input: PrismaGraphAccessRequest): AccessRequest {
    return {
      accessRequestId: input.access_request_id,
      grant: input.grant,
      groupId: input.group_id,
      userId: input.user_id as string,
      status: input.status as AccessRequestStatus,
      createdAt: input.created_at?.toISOString()
    };
  }
};

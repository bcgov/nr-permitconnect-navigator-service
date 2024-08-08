import { Prisma } from '@prisma/client';

import { AccessRequestStatus } from '../../utils/enums/application';

import type { Stamps } from '../stamps';
import type { AccessRequest } from '../../types/AccessRequest'; // Import the access_request_status_enum type

// Define types
const _accessRequest = Prisma.validator<Prisma.access_requestDefaultArgs>()({});

type PrismaRelationAccessRequest = Omit<Prisma.access_requestGetPayload<typeof _accessRequest>, keyof Stamps>;

export default {
  toPrismaModel(input: AccessRequest): PrismaRelationAccessRequest {
    return {
      access_request_id: input.accessRequestId,
      grant: input.grant,
      role: input.role,
      status: input.status as AccessRequestStatus, // Cast the status property to AccessRequestStatus enum
      user_id: input.userId as string
    };
  },

  fromPrismaModel(input: PrismaRelationAccessRequest): AccessRequest {
    return {
      accessRequestId: input.access_request_id,
      grant: input.grant,
      role: input.role,
      userId: input.user_id as string,
      status: input.status as AccessRequestStatus // Cast the status property to AccessRequestStatus enum
    };
  }
};

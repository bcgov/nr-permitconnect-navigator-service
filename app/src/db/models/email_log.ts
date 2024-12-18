import { Prisma } from '@prisma/client';

import type { EmailLog } from '../../types';

// Define types
const _emailLog = Prisma.validator<Prisma.email_logDefaultArgs>()({});
const _emailLogWithGraph = Prisma.validator<Prisma.email_logDefaultArgs>()({});

type PrismaRelationEmailLog = Prisma.email_logGetPayload<typeof _emailLog>;
type PrismaGraphEmailLog = Prisma.email_logGetPayload<typeof _emailLogWithGraph>;

export default {
  toPrismaModel(input: EmailLog): PrismaRelationEmailLog {
    return {
      email_log_id: input.emailId as string,
      http_status: input.httpStatus,
      msg_id: input.msgId ?? null,
      to: input.to ?? null,
      tx_id: input.txId ?? null,
      created_at: input.createdAt ? new Date(input.createdAt) : null,
      created_by: input.createdBy as string,
      updated_at: input.updatedAt ? new Date(input.updatedAt) : null,
      updated_by: input.updatedBy as string
    };
  },

  fromPrismaModel(input: PrismaGraphEmailLog): EmailLog {
    return {
      emailId: input.email_log_id,
      httpStatus: Number(input.http_status),
      msgId: input.msg_id || '',
      to: input.to || '',
      createdAt: input.created_at?.toISOString() ?? null,
      createdBy: input.created_by,
      updatedAt: input.updated_at?.toISOString() ?? null,
      updatedBy: input.updated_by
    };
  }
};

import { Prisma } from '@prisma/client';
import { default as permit_type } from './permit_type';
import disconnectRelation from '../utils/disconnectRelation';

import type { IStamps } from '../../interfaces/IStamps';
import type { Permit } from '../../types';

// Define types
const _permit = Prisma.validator<Prisma.permitDefaultArgs>()({});
const _permitWithGraph = Prisma.validator<Prisma.permitDefaultArgs>()({
  include: { permit_type: true }
});

type PermitTypeRelation = {
  permit_type:
    | {
        connect: {
          permitTypeId: number;
        };
      }
    | {
        disconnect: boolean;
      };
};

type SubmissionRelation = {
  submission:
    | {
        connect: {
          submissionId: string;
        };
      }
    | {
        disconnect: boolean;
      };
};

type PrismaRelationPermit = Omit<
  Prisma.permitGetPayload<typeof _permit>,
  'permitTypeId' | 'submissionId' | keyof IStamps
> &
  PermitTypeRelation &
  SubmissionRelation;

type PrismaGraphPermit = Prisma.permitGetPayload<typeof _permitWithGraph>;

export default {
  toPrismaModel(input: Permit): PrismaRelationPermit {
    return {
      permitId: input.permitId,
      trackingId: input.trackingId,
      authStatus: input.authStatus,
      needed: input.needed,
      status: input.status,
      submittedDate: input.submittedDate ? new Date(input.submittedDate) : null,
      adjudicationDate: input.adjudicationDate ? new Date(input.adjudicationDate) : null,
      permit_type: input.permitType?.permitTypeId
        ? { connect: { permitTypeId: input.permitType?.permitTypeId } }
        : disconnectRelation,
      submission: input.submissionId ? { connect: { submissionId: input.submissionId } } : disconnectRelation
    };
  },

  fromPrismaModel(input: PrismaGraphPermit | null): Permit | null {
    if (!input) return null;

    return {
      permitId: input.permitId,
      permitTypeId: input.permitTypeId,
      submissionId: input.submissionId,
      trackingId: input.trackingId,
      authStatus: input.authStatus,
      needed: input.needed,
      status: input.status,
      submittedDate: input.submittedDate?.toISOString() ?? null,
      adjudicationDate: input.adjudicationDate?.toISOString() ?? null,
      permitType: permit_type.fromPrismaModel(input.permit_type),
      submission: null,
      updatedAt: input.updatedAt?.toISOString() ?? null,
      updatedBy: input.updatedBy
    };
  }
};

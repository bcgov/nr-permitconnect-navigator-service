import { Prisma } from '@prisma/client';
import { default as permit_type } from './permit_type';
import { default as submission } from './submission';

import type { IStamps } from '../../interfaces/IStamps';
import type { ChefsSubmissionForm, Permit } from '../../types';

// Define types
const _permit = Prisma.validator<Prisma.permitDefaultArgs>()({});
const _permitWithGraph = Prisma.validator<Prisma.permitDefaultArgs>()({
  include: { permit_type: true, submission: { include: { user: true } } }
});

type PermitTypeRelation = {
  permit_type: {
    connect: {
      permitTypeId: number;
    };
  };
};

type SubmissionRelation = {
  submission: {
    connect: {
      submissionId: string;
    };
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
      issuedPermitId: input.issuedPermitId,
      trackingId: input.trackingId,
      authStatus: input.authStatus,
      needed: input.needed,
      status: input.status,
      submittedDate: input.submittedDate ? new Date(input.submittedDate) : null,
      adjudicationDate: input.adjudicationDate ? new Date(input.adjudicationDate) : null,
      permit_type: { connect: { permitTypeId: input.permitType.permitTypeId } },
      submission: { connect: { submissionId: input.submissionId } }
    };
  },

  fromPrismaModel(input: PrismaGraphPermit | null): Permit | null {
    if (!input) return null;

    return {
      permitId: input.permitId,
      permitTypeId: input.permitTypeId,
      submissionId: input.submissionId,
      issuedPermitId: input.issuedPermitId,
      trackingId: input.trackingId,
      authStatus: input.authStatus,
      needed: input.needed,
      status: input.status,
      submittedDate: input.submittedDate?.toISOString() ?? null,
      adjudicationDate: input.adjudicationDate?.toISOString() ?? null,
      permitType: permit_type.fromPrismaModel(input.permit_type),
      submission: submission.fromPrismaModel(input.submission) as ChefsSubmissionForm,
      updatedAt: input.updatedAt?.toISOString() ?? null,
      updatedBy: input.updatedBy
    };
  }
};

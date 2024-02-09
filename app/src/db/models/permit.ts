import { Prisma } from '@prisma/client';
import { default as permit_type } from './permit_type';
import { default as submission } from './submission';

import type { Stamps } from '../stamps';
import type { Submission, Permit } from '../../types';

// Define types
const _permit = Prisma.validator<Prisma.permitDefaultArgs>()({});
const _permitWithGraph = Prisma.validator<Prisma.permitDefaultArgs>()({
  include: { permit_type: true, submission: { include: { user: true } } }
});

type PermitTypeRelation = {
  permit_type: {
    connect: {
      permit_type_id: number;
    };
  };
};

type SubmissionRelation = {
  submission: {
    connect: {
      submission_id: string;
    };
  };
};

type PrismaRelationPermit = Omit<
  Prisma.permitGetPayload<typeof _permit>,
  'permit_type_id' | 'submission_id' | keyof Stamps
> &
  PermitTypeRelation &
  SubmissionRelation;

type PrismaGraphPermit = Prisma.permitGetPayload<typeof _permitWithGraph>;

export default {
  toPrismaModel(input: Permit): PrismaRelationPermit {
    return {
      permit_id: input.permitId,
      issued_permit_id: input.issuedPermitId,
      tracking_id: input.trackingId,
      auth_status: input.authStatus,
      needed: input.needed,
      status: input.status,
      submitted_date: input.submittedDate ? new Date(input.submittedDate) : null,
      adjudication_date: input.adjudicationDate ? new Date(input.adjudicationDate) : null,
      permit_type: { connect: { permit_type_id: input.permitType.permitTypeId } },
      submission: { connect: { submission_id: input.submissionId } }
    };
  },

  fromPrismaModel(input: PrismaGraphPermit | null): Permit | null {
    if (!input) return null;

    return {
      permitId: input.permit_id,
      permitTypeId: input.permit_type_id,
      submissionId: input.submission_id,
      issuedPermitId: input.issued_permit_id,
      trackingId: input.tracking_id,
      authStatus: input.auth_status,
      needed: input.needed,
      status: input.status,
      submittedDate: input.submitted_date?.toISOString() ?? null,
      adjudicationDate: input.adjudication_date?.toISOString() ?? null,
      permitType: permit_type.fromPrismaModel(input.permit_type),
      submission: submission.fromPrismaModel(input.submission) as Submission,
      updatedAt: input.updated_at?.toISOString() ?? null,
      updatedBy: input.updated_by
    };
  }
};

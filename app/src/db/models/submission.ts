import { Prisma } from '@prisma/client';
import { default as user } from './user';
import disconnectRelation from '../utils/disconnectRelation';
import { fromYrn, toYrn } from '../../components/utils';

import type { IStamps } from '../../interfaces/IStamps';
import type { ChefsSubmissionForm } from '../../types';

// Define types
const _submission = Prisma.validator<Prisma.submissionDefaultArgs>()({});
const _submissionWithRelations = Prisma.validator<Prisma.submissionDefaultArgs>()({
  include: { user: true }
});

type UserRelation = {
  user:
    | {
        connect: {
          userId: string;
        };
      }
    | {
        disconnect: boolean;
      };
};
type DBSubmission = Omit<Prisma.submissionGetPayload<typeof _submission>, 'assignedToUserId' | keyof IStamps> &
  UserRelation;

type Submission = Prisma.submissionGetPayload<typeof _submissionWithRelations>;

export default {
  toDBModel(input: ChefsSubmissionForm): DBSubmission {
    return {
      submissionId: input.submissionId,
      confirmationId: input.confirmationId,
      contactEmail: input.contactEmail,
      contactPhoneNumber: input.contactPhoneNumber,
      contactFirstName: input.contactFirstName,
      contactLastName: input.contactLastName,
      intakeStatus: input.intakeStatus,
      projectName: input.projectName,
      queuePriority: input.queuePriority,
      singleFamilyUnits: input.singleFamilyUnits,
      streetAddress: input.streetAddress,
      atsClientNumber: input.atsClientNumber,
      addedToATS: fromYrn(input.addedToATS),
      financiallySupported: fromYrn(input.financiallySupported),
      applicationStatus: input.applicationStatus,
      relatedPermits: input.relatedPermits,
      updatedAai: fromYrn(input.updatedAai),
      waitingOn: input.waitingOn,
      submittedAt: new Date(input.submittedAt),
      submittedBy: input.submittedBy,
      bringForwardDate: input.bringForwardDate ? new Date(input.bringForwardDate) : null,
      notes: input.notes,
      user: input.user?.userId ? { connect: { userId: input.user.userId } } : disconnectRelation
    };
  },

  fromDBModel(input: Submission | null): ChefsSubmissionForm | null {
    if (!input) return null;

    return {
      submissionId: input.submissionId as string,
      confirmationId: input.confirmationId as string,
      contactEmail: input.contactEmail,
      contactPhoneNumber: input.contactPhoneNumber,
      contactFirstName: input.contactFirstName,
      contactLastName: input.contactLastName,
      intakeStatus: input.intakeStatus,
      projectName: input.projectName,
      queuePriority: input.queuePriority,
      singleFamilyUnits: input.singleFamilyUnits,
      streetAddress: input.streetAddress,
      atsClientNumber: input.atsClientNumber,
      addedToATS: toYrn(input.addedToATS as boolean | null),
      financiallySupported: toYrn(input.financiallySupported as boolean | null),
      applicationStatus: input.applicationStatus,
      relatedPermits: input.relatedPermits,
      updatedAai: toYrn(input.updatedAai as boolean | null),
      waitingOn: input.waitingOn,
      submittedAt: input.submittedAt?.toISOString() as string,
      submittedBy: input.submittedBy as string,
      bringForwardDate: input.bringForwardDate?.toISOString() ?? null,
      notes: input.notes,
      user: user.fromDBModel(input.user)
    };
  }
};

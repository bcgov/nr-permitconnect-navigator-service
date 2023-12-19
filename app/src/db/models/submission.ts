import { Prisma } from '@prisma/client';

import { disconnectRelation, user } from '.';
import { fromYrn, toYrn } from '../../components/utils';

import type { ChefsSubmissionForm } from '../../types';

// Define a type that includes the relation to 'user'
const _submission = Prisma.validator<Prisma.submissionDefaultArgs>()({
  include: { user: true }
});
type submission = Prisma.submissionGetPayload<typeof _submission>;

export default {
  toPhysicalModel(input: ChefsSubmissionForm) {
    return {
      ...input,
      user: input.user?.userId ? { connect: { userId: input.user.userId } } : disconnectRelation,
      addedToATS: fromYrn(input.addedToATS),
      financiallySupported: fromYrn(input.financiallySupported),
      updatedAai: fromYrn(input.updatedAai)
    };
  },

  toLogicalModel(input: submission): ChefsSubmissionForm {
    return {
      submissionId: input.submissionId,
      confirmationId: input.confirmationId as string,
      contactEmail: input.contactEmail ?? undefined,
      contactPhoneNumber: input.contactPhoneNumber ?? undefined,
      contactFirstName: input.contactFirstName ?? undefined,
      contactLastName: input.contactLastName ?? undefined,
      intakeStatus: input.intakeStatus ?? undefined,
      projectName: input.projectName ?? undefined,
      queuePriority: input.queuePriority ?? undefined,
      singleFamilyUnits: input.singleFamilyUnits ?? undefined,
      streetAddress: input.streetAddress ?? undefined,
      atsClientNumber: input.atsClientNumber ?? undefined,
      addedToATS: toYrn(input.addedToATS),
      financiallySupported: toYrn(input.financiallySupported),
      applicationStatus: input.applicationStatus ?? undefined,
      relatedPermits: input.relatedPermits ?? undefined,
      updatedAai: toYrn(input.updatedAai),
      waitingOn: input.waitingOn ?? undefined,
      submittedAt: input.submittedAt.toISOString(),
      submittedBy: input.submittedBy,
      bringForwardDate: input.bringForwardDate?.toISOString() ?? undefined,
      notes: input.notes ?? undefined,
      user: input.user ? user.toLogicalModel(input.user) : undefined
    };
  }
};

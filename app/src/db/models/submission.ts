import { Prisma } from '@prisma/client';
import { default as user } from './user';
import disconnectRelation from '../utils/disconnectRelation';

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
type PrismaRelationSubmission = Omit<
  Prisma.submissionGetPayload<typeof _submission>,
  'assignedToUserId' | keyof IStamps
> &
  UserRelation;

type PrismaGraphSubmission = Prisma.submissionGetPayload<typeof _submissionWithRelations>;

export default {
  toPrismaModel(input: ChefsSubmissionForm): PrismaRelationSubmission {
    return {
      submissionId: input.submissionId,
      confirmationId: input.confirmationId,
      submittedAt: new Date(input.submittedAt ?? Date.now()),
      submittedBy: input.submittedBy,
      locationPIDs: input.locationPIDs,
      contactName: input.contactName,
      contactPhoneNumber: input.contactPhoneNumber,
      contactEmail: input.contactEmail,
      projectName: input.projectName,
      singleFamilyUnits: input.singleFamilyUnits,
      streetAddress: input.streetAddress,
      latitude: input.latitude,
      longitude: input.longitude,
      queuePriority: input.queuePriority,
      relatedPermits: input.relatedPermits,
      astNotes: input.astNotes,
      astUpdated: input.astUpdated,
      addedToATS: input.addedToATS,
      atsClientNumber: input.atsClientNumber,
      ltsaCompleted: input.ltsaCompleted,
      naturalDisaster: input.naturalDisaster,
      financiallySupported: input.financiallySupported,
      financiallySupportedBC: input.financiallySupportedBC,
      financiallySupportedIndigenous: input.financiallySupportedIndigenous,
      financiallySupportedNonProfit: input.financiallySupportedNonProfit,
      financiallySupportedHousingCoop: input.financiallySupportedHousingCoop,
      aaiUpdated: input.aaiUpdated,
      waitingOn: input.waitingOn,
      bringForwardDate: input.bringForwardDate ? new Date(input.bringForwardDate) : null,
      notes: input.notes,
      user: input.user?.userId ? { connect: { userId: input.user.userId } } : disconnectRelation,
      intakeStatus: input.intakeStatus,
      applicationStatus: input.applicationStatus
    };
  },

  fromPrismaModel(input: PrismaGraphSubmission | null): ChefsSubmissionForm | null {
    if (!input) return null;

    return {
      submissionId: input.submissionId,
      confirmationId: input.confirmationId,
      submittedAt: input.submittedAt?.toISOString() as string,
      submittedBy: input.submittedBy as string,
      locationPIDs: input.locationPIDs,
      contactName: input.contactName,
      contactPhoneNumber: input.contactPhoneNumber,
      contactEmail: input.contactEmail,
      projectName: input.projectName,
      singleFamilyUnits: input.singleFamilyUnits,
      streetAddress: input.streetAddress,
      latitude: input.latitude,
      longitude: input.longitude,
      queuePriority: input.queuePriority,
      relatedPermits: input.relatedPermits,
      astNotes: input.astNotes,
      astUpdated: input.astUpdated,
      addedToATS: input.addedToATS,
      atsClientNumber: input.atsClientNumber,
      ltsaCompleted: input.ltsaCompleted,
      naturalDisaster: input.naturalDisaster,
      financiallySupported: input.financiallySupported,
      financiallySupportedBC: input.financiallySupportedBC,
      financiallySupportedIndigenous: input.financiallySupportedIndigenous,
      financiallySupportedNonProfit: input.financiallySupportedNonProfit,
      financiallySupportedHousingCoop: input.financiallySupportedHousingCoop,
      aaiUpdated: input.aaiUpdated,
      waitingOn: input.waitingOn,
      bringForwardDate: input.bringForwardDate?.toISOString() ?? null,
      notes: input.notes,
      user: user.fromPrismaModel(input.user),
      intakeStatus: input.intakeStatus,
      applicationStatus: input.applicationStatus
    };
  }
};

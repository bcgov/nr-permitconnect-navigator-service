import { Prisma } from '@prisma/client';
import { default as activity } from './activity';
import { default as user } from './user';
import disconnectRelation from '../utils/disconnectRelation';

import type { Stamps } from '../stamps';
import type { Submission } from '../../types';

// Define types
const _submission = Prisma.validator<Prisma.submissionDefaultArgs>()({});
const _submissionWithGraph = Prisma.validator<Prisma.submissionDefaultArgs>()({
  include: { activity: true, user: true }
});

type ActivityRelation = {
  activity:
    | {
        connect: {
          activity_id: string;
        };
      }
    | {
        disconnect: boolean;
      };
};

type UserRelation = {
  user:
    | {
        connect: {
          user_id: string;
        };
      }
    | {
        disconnect: boolean;
      };
};

type PrismaRelationSubmission = Omit<
  Prisma.submissionGetPayload<typeof _submission>,
  'activity_id' | 'assigned_user_id' | keyof Stamps
> &
  ActivityRelation &
  UserRelation;

type PrismaGraphSubmission = Prisma.submissionGetPayload<typeof _submissionWithGraph>;

export default {
  toPrismaModel(input: Submission): PrismaRelationSubmission {
    return {
      submission_id: input.submissionId,
      project_name: input.projectName,
      submitted_at: new Date(input.submittedAt ?? Date.now()),
      submitted_by: input.submittedBy,
      location_pids: input.locationPIDs,
      contact_name: input.contactName,
      contact_phone_number: input.contactPhoneNumber,
      contact_email: input.contactEmail,
      company_name_registered: input.companyNameRegistered,
      single_family_units: input.singleFamilyUnits,
      street_address: input.streetAddress,
      latitude: input.latitude,
      longitude: input.longitude,
      queue_priority: input.queuePriority,
      related_permits: input.relatedPermits,
      ast_notes: input.astNotes,
      ast_updated: input.astUpdated,
      added_to_ats: input.addedToATS,
      ats_client_number: input.atsClientNumber,
      ltsa_completed: input.ltsaCompleted,
      bc_online_completed: input.bcOnlineCompleted,
      natural_disaster: input.naturalDisaster,
      financially_supported: input.financiallySupported,
      financially_supported_bc: input.financiallySupportedBC,
      financially_supported_indigenous: input.financiallySupportedIndigenous,
      financially_supported_non_profit: input.financiallySupportedNonProfit,
      financially_supported_housing_coop: input.financiallySupportedHousingCoop,
      aai_updated: input.aaiUpdated,
      waiting_on: input.waitingOn,
      bring_forward_date: input.bringForwardDate ? new Date(input.bringForwardDate) : null,
      notes: input.notes,
      activity: input.activity?.activityId
        ? { connect: { activity_id: input.activity.activityId } }
        : disconnectRelation,
      user: input.user?.userId ? { connect: { user_id: input.user.userId } } : disconnectRelation,
      intake_status: input.intakeStatus,
      application_status: input.applicationStatus,
      guidance: input.guidance,
      status_request: input.statusRequest,
      inquiry: input.inquiry,
      emergency_assist: input.emergencyAssist,
      inapplicable: input.inapplicable
    };
  },

  fromPrismaModel(input: PrismaGraphSubmission | null): Submission | null {
    if (!input) return null;

    return {
      submissionId: input.submission_id,
      submittedAt: input.submitted_at?.toISOString() as string,
      submittedBy: input.submitted_by as string,
      locationPIDs: input.location_pids,
      contactName: input.contact_name,
      contactPhoneNumber: input.contact_phone_number,
      contactEmail: input.contact_email,
      projectName: input.project_name,
      companyNameRegistered: input.company_name_registered,
      singleFamilyUnits: input.single_family_units,
      streetAddress: input.street_address,
      latitude: input.latitude,
      longitude: input.longitude,
      queuePriority: input.queue_priority,
      relatedPermits: input.related_permits,
      astNotes: input.ast_notes,
      astUpdated: input.ast_updated,
      addedToATS: input.added_to_ats,
      atsClientNumber: input.ats_client_number,
      ltsaCompleted: input.ltsa_completed,
      bcOnlineCompleted: input.bc_online_completed,
      naturalDisaster: input.natural_disaster,
      financiallySupported: input.financially_supported,
      financiallySupportedBC: input.financially_supported_bc,
      financiallySupportedIndigenous: input.financially_supported_indigenous,
      financiallySupportedNonProfit: input.financially_supported_non_profit,
      financiallySupportedHousingCoop: input.financially_supported_housing_coop,
      aaiUpdated: input.aai_updated,
      waitingOn: input.waiting_on,
      bringForwardDate: input.bring_forward_date?.toISOString() ?? null,
      notes: input.notes,
      activity: activity.fromPrismaModel(input.activity),
      user: user.fromPrismaModel(input.user),
      intakeStatus: input.intake_status,
      applicationStatus: input.application_status,
      guidance: input.guidance,
      statusRequest: input.status_request,
      inquiry: input.inquiry,
      emergencyAssist: input.emergency_assist,
      inapplicable: input.inapplicable
    };
  }
};

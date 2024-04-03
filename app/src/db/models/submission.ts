import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import user from './user';

import type { Stamps } from '../stamps';
import type { Submission } from '../../types';

// Define types
const _submission = Prisma.validator<Prisma.submissionDefaultArgs>()({});
const _submissionWithGraph = Prisma.validator<Prisma.submissionDefaultArgs>()({});
const _submissionWithUserGraph = Prisma.validator<Prisma.submissionDefaultArgs>()({ include: { user: true } });

type PrismaRelationSubmission = Omit<Prisma.submissionGetPayload<typeof _submission>, keyof Stamps>;
type PrismaGraphSubmission = Prisma.submissionGetPayload<typeof _submissionWithGraph>;
type PrismaGraphSubmissionUser = Prisma.submissionGetPayload<typeof _submissionWithUserGraph>;

export default {
  toPrismaModel(input: Submission): PrismaRelationSubmission {
    const test = {
      submission_id: input.submissionId,
      activity_id: input.activityId,
      assigned_user_id: input.assignedUserId,
      project_name: input.projectName,
      project_description: input.projectDescription,
      submitted_at: new Date(input.submittedAt ?? Date.now()),
      submitted_by: input.submittedBy,
      location_pids: input.locationPIDs,
      contact_name: input.contactName,
      contact_applicant_relationship: input.contactApplicantRelationship,
      contact_phone_number: input.contactPhoneNumber,
      contact_email: input.contactEmail,
      contact_preference: input.contactPreference,
      company_name_registered: input.companyNameRegistered,
      single_family_units: input.singleFamilyUnits,
      is_rental_unit: input.isRentalUnit,
      street_address: input.streetAddress,
      latitude: input.latitude ? new Decimal(input.latitude) : null,
      longitude: input.longitude ? new Decimal(input.longitude) : null,
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
      intake_status: input.intakeStatus,
      application_status: input.applicationStatus,
      guidance: input.guidance,
      status_request: input.statusRequest,
      inquiry: input.inquiry,
      emergency_assist: input.emergencyAssist,
      inapplicable: input.inapplicable
    };

    return test;
  },

  fromPrismaModel(input: PrismaGraphSubmission | null): Submission | null {
    if (!input) return null;

    return {
      submissionId: input.submission_id,
      activityId: input.activity_id,
      assignedUserId: input.assigned_user_id,
      submittedAt: input.submitted_at?.toISOString() as string,
      submittedBy: input.submitted_by,
      locationPIDs: input.location_pids,
      contactName: input.contact_name,
      contactApplicantRelationship: input.contact_applicant_relationship,
      contactPhoneNumber: input.contact_phone_number,
      contactEmail: input.contact_email,
      contactPreference: input.contact_preference,
      projectName: input.project_name,
      projectDescription: input.project_description,
      companyNameRegistered: input.company_name_registered,
      singleFamilyUnits: input.single_family_units,
      isRentalUnit: input.is_rental_unit,
      streetAddress: input.street_address,
      latitude: input.latitude ? input.latitude.toNumber() : null,
      longitude: input.longitude ? input.longitude.toNumber() : null,
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
      intakeStatus: input.intake_status,
      applicationStatus: input.application_status,
      guidance: input.guidance,
      statusRequest: input.status_request,
      inquiry: input.inquiry,
      emergencyAssist: input.emergency_assist,
      inapplicable: input.inapplicable,
      user: null
    };
  },

  fromPrismaModelWithUser(input: PrismaGraphSubmissionUser | null): Submission | null {
    if (!input) return null;

    const submission = this.fromPrismaModel(input);
    if (submission) {
      submission.user = user.fromPrismaModel(input.user);
    }

    return submission;
  }
};

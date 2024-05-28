import { Prisma } from '@prisma/client';

import user from './user';

import type { Stamps } from '../stamps';
import type { Enquiry } from '../../types';

// Define types
const _enquiry = Prisma.validator<Prisma.enquiryDefaultArgs>()({});
const _enquiryWithGraph = Prisma.validator<Prisma.enquiryDefaultArgs>()({});
const _enquiryWithUserGraph = Prisma.validator<Prisma.enquiryDefaultArgs>()({ include: { user: true } });

type PrismaRelationEnquiry = Omit<Prisma.enquiryGetPayload<typeof _enquiry>, keyof Stamps>;
type PrismaGraphEnquiry = Prisma.enquiryGetPayload<typeof _enquiryWithGraph>;
type PrismaGraphEnquiryUser = Prisma.enquiryGetPayload<typeof _enquiryWithUserGraph>;

export default {
  toPrismaModel(input: Enquiry): PrismaRelationEnquiry {
    return {
      enquiry_id: input.enquiryId,
      activity_id: input.activityId,
      assigned_user_id: input.assignedUserId,
      submitted_at: new Date(input.submittedAt ?? Date.now()),
      submitted_by: input.submittedBy,
      contact_first_name: input.contactFirstName,
      contact_last_name: input.contactLastName,
      contact_phone_number: input.contactPhoneNumber,
      contact_email: input.contactEmail,
      contact_preference: input.contactPreference,
      contact_applicant_relationship: input.contactApplicantRelationship,
      is_related: input.isRelated,
      related_activity_id: input.relatedActivityId,
      enquiry_description: input.enquiryDescription,
      apply_for_permit_connect: input.applyForPermitConnect,
      intake_status: input.intakeStatus
    };
  },

  fromPrismaModel(input: PrismaGraphEnquiry): Enquiry {
    return {
      enquiryId: input.enquiry_id,
      activityId: input.activity_id,
      assignedUserId: input.assigned_user_id,
      submittedAt: input.submitted_at?.toISOString() as string,
      submittedBy: input.submitted_by,
      contactFirstName: input.contact_first_name,
      contactLastName: input.contact_last_name,
      contactPhoneNumber: input.contact_phone_number,
      contactEmail: input.contact_email,
      contactPreference: input.contact_preference,
      contactApplicantRelationship: input.contact_applicant_relationship,
      isRelated: input.is_related,
      relatedActivityId: input.related_activity_id,
      enquiryDescription: input.enquiry_description,
      applyForPermitConnect: input.apply_for_permit_connect,
      intakeStatus: input.intake_status,
      updatedAt: input.updated_at?.toISOString() as string,
      user: null
    };
  },

  fromPrismaModelWithUser(input: PrismaGraphEnquiryUser | null): Enquiry | null {
    if (!input) return null;

    const enquiry = this.fromPrismaModel(input);
    if (enquiry && input.user) {
      enquiry.user = user.fromPrismaModel(input.user);
    }

    return enquiry;
  }
};

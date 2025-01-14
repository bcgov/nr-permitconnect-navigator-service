import { Prisma } from '@prisma/client';

import contact from './contact.ts';
import user from './user.ts';

import type { Enquiry } from '../../types/index.ts';

// Define types
const _enquiry = Prisma.validator<Prisma.enquiryDefaultArgs>()({});
const _enquiryWithContactGraph = Prisma.validator<Prisma.enquiryDefaultArgs>()({
  include: {
    activity: {
      include: {
        activity_contact: {
          include: {
            contact: true
          }
        }
      }
    }
  }
});
const _enquiryWithUserGraph = Prisma.validator<Prisma.enquiryDefaultArgs>()({
  include: {
    activity: {
      include: {
        activity_contact: {
          include: {
            contact: true
          }
        }
      }
    },
    user: true
  }
});

type PrismaRelationEnquiry = Prisma.enquiryGetPayload<typeof _enquiry>;
type PrismaGraphEnquiry = Prisma.enquiryGetPayload<typeof _enquiry>;
type PrismaGraphEnquiryWithContact = Prisma.enquiryGetPayload<typeof _enquiryWithContactGraph>;
type PrismaGraphEnquiryWithUser = Prisma.enquiryGetPayload<typeof _enquiryWithUserGraph>;

export default {
  toPrismaModel(input: Enquiry): PrismaRelationEnquiry {
    return {
      enquiry_id: input.enquiryId,
      activity_id: input.activityId,
      assigned_user_id: input.assignedUserId,
      enquiry_type: input.enquiryType,
      submitted_at: new Date(input.submittedAt ?? Date.now()),
      submitted_by: input.submittedBy,
      is_related: input.isRelated,
      related_activity_id: input.relatedActivityId,
      enquiry_description: input.enquiryDescription,
      apply_for_permit_connect: input.applyForPermitConnect,
      intake_status: input.intakeStatus,
      waiting_on: input.waitingOn,
      enquiry_status: input.enquiryStatus,
      created_at: input.createdAt ? new Date(input.createdAt) : null,
      created_by: input.createdBy as string,
      updated_at: input.updatedAt ? new Date(input.updatedAt) : null,
      updated_by: input.updatedBy as string
    };
  },

  fromPrismaModel(input: PrismaGraphEnquiry): Enquiry {
    return {
      enquiryId: input.enquiry_id,
      activityId: input.activity_id,
      assignedUserId: input.assigned_user_id,
      enquiryType: input.enquiry_type,
      submittedAt: input.submitted_at?.toISOString() as string,
      submittedBy: input.submitted_by,
      isRelated: input.is_related,
      relatedActivityId: input.related_activity_id,
      enquiryDescription: input.enquiry_description,
      applyForPermitConnect: input.apply_for_permit_connect,
      intakeStatus: input.intake_status,
      enquiryStatus: input.enquiry_status,
      waitingOn: input.waiting_on,
      contacts: [],
      user: null,
      createdAt: input.created_at?.toISOString() ?? null,
      createdBy: input.created_by,
      updatedAt: input.updated_at?.toISOString() ?? null,
      updatedBy: input.updated_by
    };
  },

  fromPrismaModelWithContact(input: PrismaGraphEnquiryWithContact): Enquiry {
    const enquiry = this.fromPrismaModel(input);
    if (enquiry && input.activity.activity_contact) {
      enquiry.contacts = input.activity.activity_contact.map((x) => contact.fromPrismaModel(x.contact));
    }

    return enquiry;
  },

  fromPrismaModelWithUser(input: PrismaGraphEnquiryWithUser): Enquiry {
    const enquiry = this.fromPrismaModelWithContact(input);
    if (enquiry && input.user) {
      enquiry.user = user.fromPrismaModel(input.user);
    }

    return enquiry;
  }
};

import { Prisma } from '@prisma/client';

import activity_contact from './activty_contact';

import type { Stamps } from '../stamps';
import type { Contact } from '../../types/';

// Define types
const _contact = Prisma.validator<Prisma.contactDefaultArgs>()({});
const _contactWithActivitiesGraph = Prisma.validator<Prisma.contactDefaultArgs>()({
  include: { activity_contact: true }
});
const _contactWithBusinessName = Prisma.validator<Prisma.contactDefaultArgs>()({
  include: { user: { select: { bceid_business_name: true } } }
});

type PrismaRelationContact = Omit<Prisma.contactGetPayload<typeof _contact>, keyof Stamps>;
type PrismaGraphContactActivities = Prisma.contactGetPayload<typeof _contactWithActivitiesGraph>;
type PrismaGraphContactBusinessName = Prisma.contactGetPayload<typeof _contactWithBusinessName>;

export default {
  toPrismaModel(input: Contact): PrismaRelationContact {
    return {
      contact_id: input.contactId,
      user_id: input.userId,
      first_name: input.firstName,
      last_name: input.lastName,
      phone_number: input.phoneNumber,
      email: input.email,
      contact_preference: input.contactPreference,
      contact_applicant_relationship: input.contactApplicantRelationship
    };
  },

  fromPrismaModel(input: PrismaRelationContact): Contact {
    return {
      contactId: input.contact_id,
      userId: input.user_id,
      firstName: input.first_name,
      lastName: input.last_name,
      phoneNumber: input.phone_number,
      email: input.email,
      contactPreference: input.contact_preference,
      contactApplicantRelationship: input.contact_applicant_relationship
    };
  },

  fromPrismaModelWithActivities(input: PrismaGraphContactActivities): Contact {
    const contact = this.fromPrismaModel(input);
    if (contact && input.activity_contact) {
      contact.activityContact = input.activity_contact.map((activity) => activity_contact.fromPrismaModel(activity));
    }

    return contact;
  },

  fromPrismaModelWithBusinessName(input: PrismaGraphContactBusinessName): Contact {
    const contact = this.fromPrismaModel(input);
    if (contact && input?.user?.bceid_business_name) {
      contact.bceidBusinessName = input.user.bceid_business_name;
    }

    return contact;
  }
};

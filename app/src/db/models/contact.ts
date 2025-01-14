import { Prisma } from '@prisma/client';

import type { Stamps } from '../stamps.ts';
import type { Contact } from '../../types/index.ts';

// Define types
const _contact = Prisma.validator<Prisma.contactDefaultArgs>()({});

type PrismaRelationContact = Omit<Prisma.contactGetPayload<typeof _contact>, keyof Stamps>;

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
  }
};

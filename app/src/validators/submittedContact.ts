import { z } from 'zod';

import { email, phoneNumber, uuidv4 } from './common.ts';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '#src/utils/constants/projectCommon';

// The shared contactSchema (contact.ts) models Contact/ContactBase, a Prisma read-payload shape -
// wrong fit for intake input. This is the actual shape every real intake form sends (housing/general/
// electrification ProjectIntakeForm.vue, EnquiryIntakeForm.vue, EnquiryListNavigator.vue's staff
// "create new" flow): an existing contactId, no userId, no audit stamps.
export const submittedContactSchema = z
  .object({
    contactId: uuidv4,
    firstName: z.string().max(255),
    lastName: z.string().max(255).nullish(),
    email,
    phoneNumber,
    contactApplicantRelationship: z.enum(PROJECT_RELATIONSHIP_LIST as [string, ...string[]]),
    contactPreference: z.enum(CONTACT_PREFERENCE_LIST as [string, ...string[]])
  })
  .strict();

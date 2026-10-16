import { z } from 'zod';

import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/projectCommon';
import { Regex } from '@/utils/enums/application';
import { isBlank, maxMessage, requiredMessage, requiredOneOf, requiredString } from '@/utils/zodSchema';

export const contactFormSchema = z.looseObject({
  userId: z.uuid('User ID must be a valid UUID').optional(),
  bceidBusinessName: z.string().optional(),
  contactApplicantRelationship: requiredOneOf('Relationship to project', PROJECT_RELATIONSHIP_LIST),
  contactPreference: requiredOneOf('Preferred contact method', CONTACT_PREFERENCE_LIST),
  email: z.string(requiredMessage('Email')).regex(new RegExp(Regex.EMAIL), 'Email must be valid'),
  firstName: requiredString('First name').max(255, maxMessage('First name', 255)),
  lastName: z.string().max(255, maxMessage('Last name', 255)).optional(),
  phoneNumber: requiredString('Phone number'),
  contactId: z.uuid({
    error: (issue) => (isBlank(issue.input) ? requiredMessage('Contact ID') : 'Contact ID must be a valid UUID')
  })
});

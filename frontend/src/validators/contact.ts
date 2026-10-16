import { z } from 'zod';

import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/projectCommon';
import { Regex } from '@/utils/enums/application';
import { isBlank, isOneOf, maxMessage, requiredMessage, requiredOneOf, requiredString } from '@/utils/zodSchema';

import type { Contact } from '@/types';

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

type StoredContact = Pick<
  Contact,
  | 'contactId'
  | 'userId'
  | 'firstName'
  | 'lastName'
  | 'phoneNumber'
  | 'email'
  | 'contactApplicantRelationship'
  | 'contactPreference'
>;

/**
 * Maps a stored contact to contact form values. Null fields become unset and unknown options are dropped,
 * so the form asks for them again.
 * @param contact - The stored contact, if any.
 * @returns The contact form values.
 */
export function toContactFormValues(contact?: StoredContact | null) {
  return {
    contactId: contact?.contactId,
    userId: contact?.userId ?? undefined,
    firstName: contact?.firstName ?? undefined,
    lastName: contact?.lastName ?? undefined,
    phoneNumber: contact?.phoneNumber ?? undefined,
    email: contact?.email ?? undefined,
    contactApplicantRelationship: isOneOf(PROJECT_RELATIONSHIP_LIST, contact?.contactApplicantRelationship)
      ? contact.contactApplicantRelationship
      : undefined,
    contactPreference: isOneOf(CONTACT_PREFERENCE_LIST, contact?.contactPreference)
      ? contact.contactPreference
      : undefined
  };
}

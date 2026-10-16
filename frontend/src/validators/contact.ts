import { object, ObjectSchema, string } from 'yup';
import { z } from 'zod';

import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/projectCommon';
import { Regex } from '@/utils/enums/application';
import { isBlank, maxMessage, requiredMessage, requiredOneOf, requiredString } from '@/utils/zodSchema';
import { emailValidator } from '@/validators/common';

import type { AuditFields, Contact, CreateContactRequest } from '@/types';

export const createContactSchema: ObjectSchema<CreateContactRequest> = object({
  userId: string().uuid('v4').optional().label('User ID'),
  bceidBusinessName: string().optional().label('BCeID business name'),
  contactApplicantRelationship: string().required().oneOf(PROJECT_RELATIONSHIP_LIST).label('Relationship to project'),
  contactPreference: string().required().oneOf(CONTACT_PREFERENCE_LIST).label('Preferred contact method'),
  email: emailValidator('Email must be valid').required().label('Email'),
  firstName: string().required().max(255).label('First name'),
  lastName: string().max(255).optional().label('Last name'),
  phoneNumber: string().required().label('Phone number')
});

type ContactDto = Omit<Contact, keyof AuditFields | 'activityContact'>;

export const contactSchema: ObjectSchema<ContactDto> = createContactSchema.concat(
  object({
    contactId: string().required().uuid('v4').label('Contact ID')
  })
);

// zod copy of contactSchema; the yup version is removed once its last consumer migrates
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

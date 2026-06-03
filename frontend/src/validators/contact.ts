import { object, ObjectSchema, string } from 'yup';

import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/projectCommon';
import { emailValidator } from '@/validators/common';

import type { AuditFields, Contact, CreateContactDto } from '@/types';

export const createContactSchema: ObjectSchema<CreateContactDto> = object({
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
    contactId: string().required().uuid('v4').label('Contact ID'),
    userId: string().uuid('v4').optional().label('User ID')
  })
);

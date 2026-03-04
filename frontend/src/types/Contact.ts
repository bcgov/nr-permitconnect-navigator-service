import type { IStamps } from '@/interfaces';
import type { ActivityContact } from '@/types';
import type { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

interface ContactBase {
  bceidBusinessName?: string;
  contactApplicantRelationship: ProjectRelationship;
  contactPreference: ContactPreference;
  email: string;
  firstName: string;
  lastName?: string;
  phoneNumber: string;
}

export interface Contact extends ContactBase, IStamps {
  contactId: string;
  userId?: string;
  activityContact?: ActivityContact[];
}

export type CreateContactDto = ContactBase;

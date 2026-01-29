import type { IStamps } from '@/interfaces';
import type { ActivityContact } from '@/types';
import type { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

export type Contact = {
  bceidBusinessName?: string;
  contactId: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  contactPreference?: ContactPreference;
  contactApplicantRelationship?: ProjectRelationship;
  activityContact?: ActivityContact[];
} & Partial<IStamps>;

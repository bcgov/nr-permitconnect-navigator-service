import { string } from 'yup';

import { ContactPreferenceList, ProjectRelationshipList } from '@/utils/constants';
import { emailValidator } from '@/validators/common';

export default {
  contactPreference: string().oneOf(ContactPreferenceList).label('Preferred contact method'),
  contactEmail: emailValidator('Contact email must be valid').required().label('Contact email'),
  contactFirstName: string().required().max(255).label('Contact first name'),
  contactLastName: string().required().max(255).label('Contact last name'),
  contactPhoneNumber: string().required().label('Contact phone number'),
  contactApplicantRelationship: string().required().oneOf(ProjectRelationshipList).label('Relationship to project')
};

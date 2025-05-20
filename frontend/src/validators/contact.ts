import { string } from 'yup';

import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/projectCommon';
import { emailValidator } from '@/validators/common';

const contact = {
  contactPreference: string().required().oneOf(CONTACT_PREFERENCE_LIST).label('Preferred contact method'),
  contactEmail: emailValidator('Contact email must be valid').required().label('Contact email'),
  contactFirstName: string().required().max(255).label('Contact first name'),
  contactLastName: string().max(255).label('Contact last name').nullable(),
  contactPhoneNumber: string().required().label('Contact phone number'),
  contactApplicantRelationship: string().required().oneOf(PROJECT_RELATIONSHIP_LIST).label('Relationship to project')
};

export default contact;

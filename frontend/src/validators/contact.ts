import { string } from 'yup';

import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/housing';
import { emailValidator } from '@/validators/common';

const contact = {
  contactPreference: string().oneOf(CONTACT_PREFERENCE_LIST).label('Preferred contact method'),
  email: emailValidator('Contact email must be valid').required().label('Contact email'),
  firstName: string().required().max(255).label('Contact first name'),
  lastName: string().required().max(255).label('Contact last name'),
  phoneNumber: string().required().label('Contact phone number'),
  contactApplicantRelationship: string().required().oneOf(PROJECT_RELATIONSHIP_LIST).label('Relationship to project')
};

export default contact;

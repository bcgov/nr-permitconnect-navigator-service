import Joi from 'joi';

import { email, phoneNumber } from './common';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '../utils/constants/housing';

export const applicant = Joi.object({
  contactPreference: Joi.string().valid(...CONTACT_PREFERENCE_LIST),
  contactEmail: email.required(),
  contactFirstName: Joi.string().required().max(255),
  contactLastName: Joi.string().required().max(255),
  contactPhoneNumber: phoneNumber.required(),
  contactApplicantRelationship: Joi.string()
    .required()
    .valid(...PROJECT_RELATIONSHIP_LIST)
});

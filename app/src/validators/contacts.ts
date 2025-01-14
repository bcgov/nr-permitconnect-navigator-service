import Joi from 'joi';

import { email, phoneNumber, uuidv4 } from './common';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '../utils/constants/housing.ts';

export const contacts = Joi.array()
  .items(
    Joi.object({
      contactId: uuidv4.allow(null),
      userId: uuidv4.allow(null),
      contactPreference: Joi.string().valid(...CONTACT_PREFERENCE_LIST),
      email: email.required(),
      firstName: Joi.string().required().max(255),
      lastName: Joi.string().required().max(255),
      phoneNumber: phoneNumber.required(),
      contactApplicantRelationship: Joi.string()
        .required()
        .valid(...PROJECT_RELATIONSHIP_LIST)
    })
  )
  .allow(null);

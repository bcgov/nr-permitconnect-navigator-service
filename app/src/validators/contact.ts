import Joi from 'joi';

import { email, phoneNumber, uuidv4 } from './common';
import { validate } from '../middleware/validation';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '../utils/constants/housing';

export const contacts = Joi.array()
  .items(
    Joi.object({
      contactId: uuidv4.allow(null),
      userId: uuidv4.allow(null),
      contactPreference: Joi.string().valid(...CONTACT_PREFERENCE_LIST),
      email: email.required(),
      firstName: Joi.string().required().max(255),
      lastName: Joi.string().max(255).allow(null),
      phoneNumber: phoneNumber.required(),
      contactApplicantRelationship: Joi.string()
        .required()
        .valid(...PROJECT_RELATIONSHIP_LIST)
    })
  )
  .allow(null);

const schema = {
  searchContacts: {
    query: Joi.object({
      identityId: uuidv4.allow(null),
      userId: Joi.array().items(uuidv4).allow(null),
      contactId: Joi.array().items(uuidv4).allow(null),
      email: Joi.string().max(255).allow(null),
      firstName: Joi.string().max(255).allow(null),
      lastName: Joi.string().max(255).allow(null),
      phoneNumber: Joi.number().max(255).allow(null),
      contactApplicantRelationship: Joi.string()
        .allow(null)
        .valid(...PROJECT_RELATIONSHIP_LIST),
      contactPreference: Joi.string()
        .valid(...CONTACT_PREFERENCE_LIST)
        .allow(null)
    })
  },
  updateContact: {
    body: Joi.object({
      userId: uuidv4.required(),
      contactId: uuidv4.required(),
      email: Joi.string().max(255).required(),
      firstName: Joi.string().max(255).required(),
      lastName: Joi.string().max(255).allow(null),
      phoneNumber: phoneNumber.required(),
      contactApplicantRelationship: Joi.string()
        .required()
        .valid(...PROJECT_RELATIONSHIP_LIST),
      contactPreference: Joi.string()
        .valid(...CONTACT_PREFERENCE_LIST)
        .required()
    }),
    params: Joi.object({
      contactId: uuidv4.required()
    })
  }
};

export default {
  searchContacts: validate(schema.searchContacts),
  updateContact: validate(schema.updateContact)
};

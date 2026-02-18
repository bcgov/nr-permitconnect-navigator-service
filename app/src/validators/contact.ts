import Joi from 'joi';

import { email, phoneNumber, uuidv4 } from './common.ts';
import { validate } from '../middleware/validation.ts';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '../utils/constants/projectCommon.ts';
import { Initiative } from '../utils/enums/application.ts';

export const contactSchema = Joi.object({
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
});

export const contacts = Joi.array().items(contactSchema).allow(null);

const schema = {
  deleteContact: {
    params: Joi.object({
      contactId: uuidv4.required()
    })
  },
  getContact: {
    params: Joi.object({
      contactId: uuidv4.required()
    }),
    query: Joi.object({
      includeActivities: Joi.boolean()
    })
  },
  matchContacts: {
    query: Joi.object({
      email: Joi.string().max(255).allow(null),
      firstName: Joi.string().max(255).allow(null),
      lastName: Joi.string().max(255).allow(null),
      phoneNumber: phoneNumber.allow(null)
    })
  },
  searchContacts: {
    body: Joi.object({
      userId: Joi.array().items(uuidv4).allow(null),
      contactId: Joi.array().items(uuidv4).allow(null),
      email: Joi.string().max(255).allow(null),
      firstName: Joi.string().max(255).allow(null),
      lastName: Joi.string().max(255).allow(null),
      phoneNumber: phoneNumber.allow(null),
      contactApplicantRelationship: Joi.string()
        .allow(null)
        .valid(...PROJECT_RELATIONSHIP_LIST),
      contactPreference: Joi.string()
        .valid(...CONTACT_PREFERENCE_LIST)
        .allow(null),
      hasActivity: Joi.boolean().default(false),
      initiative: Joi.string()
        .valid(...Object.values(Initiative))
        .allow(null),
      includeActivities: Joi.boolean().default(false)
    })
  },
  upsertContact: {
    body: Joi.object({
      userId: uuidv4.allow(null),
      contactId: uuidv4.allow(null),
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
    })
  }
};

export default {
  deleteContact: validate(schema.deleteContact),
  getContact: validate(schema.getContact),
  getContactActivities: validate(schema.getContact),
  matchContacts: validate(schema.matchContacts),
  searchContacts: validate(schema.searchContacts),
  upsertContact: validate(schema.upsertContact)
};

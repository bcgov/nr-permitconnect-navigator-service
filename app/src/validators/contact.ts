import { z } from 'zod';

import { email, phoneNumber, queryBoolean, uuidv4 } from './common.ts';
import { validate } from '#src/middleware/validation';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '#src/utils/constants/projectCommon';
import { Initiative } from '#src/utils/enums/application';

const contactPreference = z.enum(CONTACT_PREFERENCE_LIST as [string, ...string[]]);
const projectRelationship = z.enum(PROJECT_RELATIONSHIP_LIST as [string, ...string[]]);

export const contactSchema = z
  .object({
    contactId: uuidv4.nullish(),
    userId: uuidv4.nullish(),
    contactPreference: contactPreference.optional(),
    email: email,
    firstName: z.string().max(255),
    lastName: z.string().max(255).nullish(),
    phoneNumber: phoneNumber,
    contactApplicantRelationship: projectRelationship
  })
  .strict();

export const schema = {
  deleteContact: {
    params: z
      .object({
        contactId: uuidv4
      })
      .strict()
  },
  getContact: {
    params: z
      .object({
        contactId: uuidv4
      })
      .strict(),
    query: z
      .object({
        includeActivities: queryBoolean.optional()
      })
      .strict()
  },
  matchContacts: {
    body: z
      .object({
        contactId: z.array(uuidv4).nullish(),
        userId: z.array(uuidv4).nullish(),
        email: z.string().max(255).nullish(),
        firstName: z.string().max(255).nullish(),
        lastName: z.string().max(255).nullish(),
        phoneNumber: phoneNumber.nullish()
      })
      .strict()
  },
  searchContacts: {
    body: z
      .object({
        userId: z.array(uuidv4).nullish(),
        contactId: z.array(uuidv4).nullish(),
        email: z.string().max(255).nullish(),
        firstName: z.string().max(255).nullish(),
        lastName: z.string().max(255).nullish(),
        phoneNumber: phoneNumber.nullish(),
        contactApplicantRelationship: projectRelationship.nullish(),
        contactPreference: contactPreference.nullish(),
        hasActivity: z.boolean().default(false),
        initiative: z.enum(Object.values(Initiative) as [string, ...string[]]).nullish(),
        includeActivities: z.boolean().default(false)
      })
      .strict()
      .default({})
  },
  upsertContact: {
    body: z
      .object({
        userId: uuidv4.nullish(),
        contactId: uuidv4.nullish(),
        email: z.string().max(255),
        firstName: z.string().max(255),
        lastName: z.string().max(255).nullish(),
        phoneNumber: phoneNumber,
        contactApplicantRelationship: projectRelationship,
        contactPreference: contactPreference
      })
      .strict()
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

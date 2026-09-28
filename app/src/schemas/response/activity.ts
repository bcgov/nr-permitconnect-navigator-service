import { z } from 'zod';

import {
  activity_contactModelSchema,
  activityModelSchema,
  contactModelSchema,
  initiativeModelSchema
} from '#prismaZod';

// activity, minus every relation none of the response schemas that embed it ever include (only
// activityContact is ever populated, and its shape differs by caller - see draftSchema.ts and
// activityWithContactsSchema below).
export const activityBaseSchema = activityModelSchema.omit({
  initiative: true,
  document: true,
  draft: true,
  electrificationProject: true,
  enquiry: true,
  generalProject: true,
  housingProject: true,
  noteHistory: true,
  permit: true
});

// contact, minus its own relations - the shape returned wherever contact is nested under
// activity/activityContact or attached directly (e.g. createEnquiryResponseSchema.ts,
// activityContactSchema.ts).
export const contactResponseSchema = contactModelSchema.omit({ activityContact: true, user: true });

// activity.activityContact.contact as included by get/list/search/patch on housing/electrification/
// general project and enquiry - see their respective services/repositories for the include shape.
const activityContactWithContactSchema = activity_contactModelSchema
  .omit({ activity: true })
  .extend({ contact: contactResponseSchema });

// initiative is only included by domains/project.ts's getProjectByActivityId/getProjectByProjectId
// (its ACTIVITY_INCLUDE) - service-layer project/enquiry/draft reads never include it.
const initiativeBaseSchema = initiativeModelSchema.omit({
  activity: true,
  permitTypeInitiativeXref: true,
  group: true
});

export const activityWithContactsSchema = activityBaseSchema.extend({
  activityContact: z.array(activityContactWithContactSchema),
  initiative: initiativeBaseSchema.optional()
});

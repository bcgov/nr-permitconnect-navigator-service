import { activityModelSchema } from '#prismaZod';

// activity, minus every relation none of the response schemas that embed it ever include (only
// activityContact is ever populated, and its shape differs by caller - see housingProjectSchema.ts
// and draftSchema.ts).
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

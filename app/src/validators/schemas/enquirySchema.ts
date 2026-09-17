import { activityWithContactsSchema, contactResponseSchema } from './activitySchema.ts';
import '#src/validators/openapi';
import { enquiryModelSchema } from '#prismaZod';
import { userSchema } from '#src/validators/schemas/userSchema';

// user is only included by listEnquiriesService/searchEnquiriesService (when requested) - see
// src/services/enquiry.ts, src/repositories/enquiry.ts.
export const enquirySchema = enquiryModelSchema
  .omit({ activity: true, user: true })
  .extend({
    activity: activityWithContactsSchema.optional(),
    user: userSchema.nullable().optional()
  })
  .openapi('Enquiry');

// createEnquiryService returns the bare created row plus a separately-attached contact, not
// nested under activity - see src/services/enquiry.ts.
export const createEnquiryResponseSchema = enquiryModelSchema
  .omit({ activity: true, user: true })
  .extend({ contact: contactResponseSchema })
  .openapi('CreateEnquiryResponse');

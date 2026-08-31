import { z } from 'zod';

import atsValidator from './ats.ts';
import { uuidv4 } from './common.ts';
import { contactSchema } from './contact.ts';
import { validate } from '#src/middleware/validation';
import {
  APPLICATION_STATUS_LIST,
  ENQUIRY_SUBMITTED_METHOD,
  ENQUIRY_TYPE_LIST
} from '#src/utils/constants/projectCommon';

export const schema = {
  createEnquiry: {
    body: z.object({
      contact: contactSchema,
      enquiryDescription: z.string().nullish(), // allow null for creating an enquiry from the nav side
      relatedActivityId: z.string().max(255).nullish(),
      submissionType: z.enum(ENQUIRY_TYPE_LIST as [string, ...string[]]).nullish()
    })
  },
  deleteEnquiry: {
    params: z.object({
      enquiryId: uuidv4
    })
  },
  getEnquiry: {
    params: z.object({
      enquiryId: uuidv4
    })
  },
  searchEnquiries: {
    body: z.object({
      activityId: z.array(z.string()).optional(),
      createdBy: z.array(z.string()).optional(),
      enquiryId: z.array(z.string()).optional(),
      includeUser: z.boolean().optional()
    })
  },
  patchEnquiry: {
    body: z.object({
      submissionType: z.string().nullish(),
      relatedActivityId: z.string().max(255).nullish(),
      enquiryDescription: z.string().nullish(),
      assignedUserId: uuidv4.nullish(),
      enquiryStatus: z.enum(APPLICATION_STATUS_LIST as [string, ...string[]]).optional(),
      submittedMethod: z.enum(ENQUIRY_SUBMITTED_METHOD as [string, ...string[]]).optional(),
      ...atsValidator.atsEnquirySubmissionFields
    })
  }
};

export default {
  createEnquiry: validate(schema.createEnquiry),
  deleteEnquiry: validate(schema.deleteEnquiry),
  getEnquiry: validate(schema.getEnquiry),
  searchEnquiries: validate(schema.searchEnquiries),
  patchEnquiry: validate(schema.patchEnquiry)
};

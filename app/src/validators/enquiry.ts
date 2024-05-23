import Joi from 'joi';

import { applicantSchema } from './applicant';
import { basicEnquirySchema } from './basic';
import { validate } from '../middleware/validation';

const schema = {
  createDraft: {
    body: Joi.object({
      applicant: applicantSchema,
      basic: basicEnquirySchema,
      submit: Joi.boolean()
    })
  },
  updateDraft: {
    body: Joi.object({
      applicant: applicantSchema,
      basic: basicEnquirySchema,
      submit: Joi.boolean(),
      enquiryId: Joi.string().required(),
      activityId: Joi.string().required()
    })
  }
};

export default {
  createDraft: validate(schema.createDraft),
  updateDraft: validate(schema.updateDraft)
};

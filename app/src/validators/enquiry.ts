import Joi from 'joi';

import { applicant } from './applicant';
import { basicEnquiry } from './basic';
import { validate } from '../middleware/validation';

const schema = {
  createDraft: {
    body: Joi.object({
      applicant: applicant,
      basic: basicEnquiry,
      submit: Joi.boolean()
    })
  },
  updateDraft: {
    body: Joi.object({
      applicant: applicant,
      basic: basicEnquiry,
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

import Joi from 'joi';

import { applicantSchema } from './applicant';
// import { appliedPermitsSchema } from './appliedPermits';
import { basicEnquirySchema } from './basic';
// import { activityId, emailJoi, uuidv4 } from './common';
// import { YesNo } from '../components/constants';
// import { housingSchema } from './housing';
// import { permitsSchema } from './permits';
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

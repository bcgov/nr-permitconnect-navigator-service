import Joi from 'joi';

import { YES_NO, YES_NO_UNSURE } from '../components/constants';

export const permitsSchema = Joi.object({
  checkProvincialPermits: Joi.when('hasAppliedProvincialPermits', {
    switch: [
      {
        is: YES_NO_UNSURE.YES,
        then: Joi.string()
          .valid(...Object.values(YES_NO))
          .required()
      },
      {
        is: YES_NO_UNSURE.UNSURE,
        then: Joi.string()
          .valid(...Object.values(YES_NO))
          .required()
      }
    ],
    otherwise: Joi.forbidden()
  }),
  hasAppliedProvincialPermits: Joi.string()
    .valid(...Object.values(YES_NO_UNSURE))
    .required()
});

import Joi from 'joi';

import { YES_NO_LIST, YES_NO_UNSURE_LIST } from '../utils/constants/application';
import { BasicResponse } from '../utils/enums/application';

export const permits = Joi.object({
  checkProvincialPermits: Joi.when('hasAppliedProvincialPermits', {
    switch: [
      {
        is: BasicResponse.YES,
        then: Joi.string()
          .required()
          .valid(...YES_NO_LIST)
      },
      {
        is: BasicResponse.UNSURE,
        then: Joi.string()
          .required()
          .valid(...YES_NO_LIST)
      }
    ],
    otherwise: Joi.forbidden()
  }),
  hasAppliedProvincialPermits: Joi.string()
    .required()
    .valid(...YES_NO_UNSURE_LIST)
});

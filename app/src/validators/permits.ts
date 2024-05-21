import Joi from 'joi';

import { YES_NO_UNSURE } from '../components/constants';
import { stringRequiredYesNo, stringRequiredYesNoUnsure } from './common';

export const permitsSchema = Joi.object({
  checkProvincialPermits: Joi.when('hasAppliedProvincialPermits', {
    switch: [
      {
        is: YES_NO_UNSURE.YES,
        then: stringRequiredYesNo
      },
      {
        is: YES_NO_UNSURE.UNSURE,
        then: stringRequiredYesNo
      }
    ],
    otherwise: Joi.forbidden()
  }),
  hasAppliedProvincialPermits: stringRequiredYesNoUnsure
});

import Joi from 'joi';

import { stringRequiredMaxLengthTrim, stringRequiredYesNo } from './common';
import { YES_NO } from '../components/constants';

export const basicSchema = Joi.object({
  isDevelopedByCompanyOrOrg: stringRequiredYesNo,
  isDevelopedInBC: stringRequiredYesNo,
  registeredName: Joi.when('isDevelopedInBC', {
    is: YES_NO.YES,
    then: stringRequiredMaxLengthTrim,
    otherwise: Joi.forbidden()
  })
});

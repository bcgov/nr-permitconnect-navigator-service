import Joi from 'joi';

import { YES_NO_UNSURE_LIST } from '../utils/constants/application.ts';

export const permits = Joi.object({
  hasAppliedProvincialPermits: Joi.string()
    .required()
    .valid(...YES_NO_UNSURE_LIST)
});

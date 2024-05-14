import Joi from 'joi';

import {
  EMAIL_REGEX,
  PHONE_NUMBER_REGEX,
  PHONE_NUMBER_MAX_LENGTH,
  TEXT_MAX_LENGTH,
  YES_NO,
  YES_NO_UNSURE
} from '../components/constants';

export const activityId = Joi.string().min(8).max(8).required();

export const emailJoi = Joi.string().pattern(new RegExp(EMAIL_REGEX)).max(TEXT_MAX_LENGTH);

export const uuidv4 = Joi.string().guid({ version: 'uuidv4' });

export const phoneNumberJoi = Joi.string().regex(new RegExp(PHONE_NUMBER_REGEX)).max(PHONE_NUMBER_MAX_LENGTH);

export const stringRequiredMaxLengthTrim = Joi.string().max(TEXT_MAX_LENGTH).required().trim();

export const stringRequiredYesNo = Joi.string()
  .valid(...Object.values(YES_NO))
  .required();

export const stringRequiredYesNoUnsure = Joi.string()
  .valid(...Object.values(YES_NO_UNSURE))
  .required();

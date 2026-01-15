import Joi from 'joi';

import { Regex } from '../utils/enums/application.ts';

export const activityId = Joi.string().min(8).max(8).required();

export const dateOnlyString = Joi.string()
  .pattern(new RegExp(Regex.DATE_ONLY))
  .custom((value: string | number | Date, helpers) => {
    const d = new Date(value);
    const canonical = d.toISOString().slice(0, 10);
    if (canonical !== value) {
      return helpers.error('date.invalid');
    }
    if (d.getTime() > Date.now()) {
      return helpers.error('date.max');
    }
    return value;
  }, 'date-only with max-now')
  .message('"Must be a valid date in the format YYYY-MM-DD"');

export const email = Joi.string().pattern(new RegExp(Regex.EMAIL));

export const phoneNumber = Joi.string().regex(new RegExp(Regex.PHONE_NUMBER));

export const timeTzString = Joi.string()
  .pattern(new RegExp(Regex.TIMETZ))
  .message('Must be a valid UTC time string (HH:MM:SS(.ffffff)Z)');

export const uuidv4 = Joi.string().guid({ version: 'uuidv4' });

import Joi from 'joi';

import { Regex } from '../utils/enums/application';

export const activityId = Joi.string().min(8).max(8).required();

export const email = Joi.string().pattern(new RegExp(Regex.EMAIL));

export const phoneNumber = Joi.string().regex(new RegExp(Regex.PHONE_NUMBER));

export const uuidv4 = Joi.string().guid({ version: 'uuidv4' });

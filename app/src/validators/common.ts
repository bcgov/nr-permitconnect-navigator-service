import Joi from 'joi';

import { EMAIL_REGEX } from '../components/constants';

export const activityId = Joi.string().min(8).max(8).required();

export const emailJoi = Joi.string().pattern(new RegExp(EMAIL_REGEX)).max(255);

export const uuidv4 = Joi.string().guid({ version: 'uuidv4' });

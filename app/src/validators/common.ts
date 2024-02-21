import Joi from 'joi';

export const activityId = Joi.string().min(8).max(8).required();

export const uuidv4 = Joi.string().guid({ version: 'uuidv4' });

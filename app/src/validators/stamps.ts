import Joi from 'joi';

import { uuidv4 } from './common';

export const createStamps = {
  createdAt: Joi.date().max('now').allow(null),
  createdBy: uuidv4.allow(null),
  updatedAt: Joi.date().max('now').allow(null),
  updatedBy: uuidv4.allow(null)
};

export const updateStamps = {
  createdAt: Joi.date().max('now'),
  createdBy: uuidv4,
  updatedAt: Joi.date().max('now').allow(null),
  updatedBy: uuidv4.allow(null)
};

import Joi from 'joi';

import { uuidv4 } from './common.ts';

export const createStamps = {
  createdAt: Joi.date().max('now').allow(null),
  createdBy: uuidv4.allow(null),
  updatedAt: Joi.date().max('now').allow(null),
  updatedBy: uuidv4.allow(null),
  deletedAt: Joi.date().max('now').allow(null),
  deletedBy: uuidv4.allow(null)
};

export const updateStamps = {
  createdAt: Joi.date().max('now'),
  createdBy: uuidv4,
  updatedAt: Joi.date().max('now'),
  updatedBy: uuidv4,
  deletedAt: Joi.date().max('now').allow(null),
  deletedBy: uuidv4.allow(null)
};

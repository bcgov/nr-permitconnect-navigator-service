import Joi from 'joi';

export const createStamps = {
  createdAt: Joi.date().max('now').allow(null),
  createdBy: Joi.string().max(255).allow(null),
  updatedAt: Joi.date().max('now').allow(null),
  updatedBy: Joi.string().max(255).allow(null)
};

export const updateStamps = {
  createdAt: Joi.date().max('now'),
  createdBy: Joi.string().max(255),
  updatedAt: Joi.date().max('now').allow(null),
  updatedBy: Joi.string().max(255).allow(null)
};

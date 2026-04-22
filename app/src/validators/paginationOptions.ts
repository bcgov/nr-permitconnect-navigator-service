import Joi from 'joi';

export const paginationOptions = Joi.object({
  skip: Joi.string().allow(null),
  sortField: Joi.string().allow(null),
  sortOrder: Joi.string().allow(null).valid('-1', '0', '1'),
  take: Joi.string().allow(null)
});

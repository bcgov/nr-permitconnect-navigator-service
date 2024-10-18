import Joi from 'joi';

import { validate } from '../middleware/validation';

import { BasicResponse } from '../utils/enums/application';

const addressBody = {
  '@type': 'AddressResource',
  addressLine1: Joi.string().max(255).allow(null),
  city: Joi.string().max(255).allow(null),
  provinceCode: Joi.string().max(255).allow(null),
  primaryPhone: Joi.string().max(255).allow(null),
  email: Joi.string().max(255).allow(null)
};

const clientBody = {
  '@type': 'ClientResource',
  firstName: Joi.string().max(255).required(),
  surName: Joi.string().max(255).required(),
  regionName: Joi.string().max(255).required(),
  optOutOfBCStatSurveyInd: BasicResponse.NO.toUpperCase(),
  address: Joi.object(addressBody).required()
};

const schema = {
  createATSClient: {
    body: Joi.object(clientBody)
  }
};

export default {
  createATSClient: validate(schema.createATSClient)
};

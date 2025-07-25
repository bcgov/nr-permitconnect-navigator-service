import Joi from 'joi';

import { validate } from '../middleware/validation';

import { BasicResponse } from '../utils/enums/application';

const addressBody = {
  '@type': Joi.string().valid('AddressResource'),
  addressLine1: Joi.string().max(255).allow(null),
  city: Joi.string().max(255).allow(null),
  provinceCode: Joi.string().max(255).allow(null),
  primaryPhone: Joi.string().max(255).allow(null),
  email: Joi.string().max(255).allow(null)
};

const clientBody = {
  '@type': Joi.string().valid('ClientResource'),
  firstName: Joi.string().max(255).required(),
  surName: Joi.string().max(255).required(),
  regionName: Joi.string().max(255).required(),
  optOutOfBCStatSurveyInd: Joi.string().valid(BasicResponse.NO.toUpperCase()),
  address: Joi.object(addressBody).allow(null)
};

const enquiryBody = {
  '@type': Joi.string().valid('EnquiryResource'),
  clientId: Joi.number().min(0).required(),
  contactFirstName: Joi.string().max(255).required(),
  contactSurname: Joi.string().max(255).required(),
  regionName: Joi.string().max(255).required(),
  notes: Joi.string().max(255).required(),
  subRegionalOffice: Joi.string().max(255).required(),
  enquiryTypeCodes: Joi.array().items(Joi.string().max(255)).required(),
  enquiryMethodCodes: Joi.array().items(Joi.string().max(255)).required(),
  enquiryPartnerAgencies: Joi.array().items(Joi.string().max(255)).required(),
  enquiryFileNumbers: Joi.array().items(Joi.string().max(255)).required()
};

const atsEnquirySubmissionFields = {
  addedToAts: Joi.boolean().required(),
  // ATS DDL: CLIENT_ID NUMBER(38,0) - may contain up to 38 digits
  atsClientId: Joi.number().integer().min(0).allow(null),
  atsEnquiryId: Joi.number().integer().min(0).allow(null)
};

const schema = {
  createATSClient: {
    body: Joi.object(clientBody)
  },
  createATSEnquiry: {
    body: Joi.object(enquiryBody)
  }
};

export default {
  createATSClient: validate(schema.createATSClient),
  atsEnquirySubmissionFields,
  createATSEnquiry: validate(schema.createATSEnquiry)
};

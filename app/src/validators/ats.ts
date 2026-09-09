import { z } from 'zod';

import { validate } from '#src/middleware/validation';
import { BasicResponse } from '#src/utils/enums/application';

const addressBody = {
  '@type': z.literal('AddressResource').optional(),
  addressLine1: z.string().min(1).max(255).nullish(),
  city: z.string().min(1).max(255).nullish(),
  provinceCode: z.string().min(1).max(255).nullish(),
  primaryPhone: z.string().min(1).max(255).nullish(),
  email: z.string().min(1).max(255).nullish()
};

const clientBody = {
  '@type': z.literal('ClientResource').optional(),
  firstName: z.string().min(1).max(255),
  surName: z.string().min(1).max(255),
  regionName: z.string().min(1).max(255),
  optOutOfBCStatSurveyInd: z.literal(BasicResponse.NO.toUpperCase()).optional(),
  address: z.object(addressBody).strict().nullish()
};

const enquiryBody = {
  '@type': z.literal('EnquiryResource').optional(),
  clientId: z.number().min(0),
  contactFirstName: z.string().min(1).max(255),
  contactSurname: z.string().min(1).max(255),
  regionName: z.string().min(1).max(255),
  notes: z.string().min(1).max(4000),
  subRegionalOffice: z.string().min(1).max(255),
  enquiryTypeCodes: z.array(z.string().min(1).max(255)),
  enquiryMethodCodes: z.array(z.string().min(1).max(255)),
  enquiryPartnerAgencies: z.array(z.string().min(1).max(255)),
  enquiryFileNumbers: z.array(z.string().min(1).max(255))
};

export const atsEnquirySubmissionFields = {
  addedToAts: z.boolean().optional(),
  // ATS DDL: CLIENT_ID NUMBER(38,0) - may contain up to 38 digits
  atsClientId: z.number().int().min(0).nullish(),
  atsEnquiryId: z.number().int().min(0).nullish()
};

export const schema = {
  createATSClient: {
    body: z.object(clientBody).strict()
  },
  createATSEnquiry: {
    body: z.object(enquiryBody).strict()
  },
  searchATSUsers: {
    query: z
      .object({
        clientId: z.string().max(255).optional(),
        email: z.string().max(255).optional(),
        firstName: z.string().max(255).optional(),
        lastName: z.string().max(255).optional(),
        phone: z.string().max(255).optional()
      })
      .strict()
  }
};

export default {
  createATSClient: validate(schema.createATSClient),
  atsEnquirySubmissionFields,
  createATSEnquiry: validate(schema.createATSEnquiry),
  searchATSUsers: validate(schema.searchATSUsers)
};

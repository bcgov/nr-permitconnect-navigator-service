import Joi from 'joi';

import { NUM_RESIDENTIAL_UNITS, TEXT_MAX_LENGTH, YES_NO, YES_NO_UNSURE } from '../components/constants';

export const housingSchema = Joi.object({
  financiallySupportedBC: Joi.string()
    .valid(...Object.values(YES_NO_UNSURE))
    .required(),
  financiallySupportedIndigenous: Joi.string()
    .valid(...Object.values(YES_NO_UNSURE))
    .required(),
  financiallySupportedNonProfit: Joi.string()
    .valid(...Object.values(YES_NO_UNSURE))
    .required(),
  financiallySupportedHousingCoop: Joi.string()
    .valid(...Object.values(YES_NO_UNSURE))
    .required(),
  hasRentalUnits: Joi.string()
    .valid(...Object.values(YES_NO_UNSURE))
    .required(),
  housingCoopDescription: Joi.string().when('financiallySupportedHousingCoop', {
    is: YES_NO.YES,
    then: Joi.string().max(TEXT_MAX_LENGTH).required(),
    otherwise: Joi.forbidden()
  }),
  indigenousDescription: Joi.string().when('financiallySupportedIndigenous', {
    is: YES_NO.YES,
    then: Joi.string().max(TEXT_MAX_LENGTH).required(),
    otherwise: Joi.forbidden()
  }),
  multiFamilySelected: Joi.boolean().allow(null),
  multiFamilyUnits: Joi.string().when('multiFamilySelected', {
    is: Joi.exist(),
    then: Joi.string()
      .valid(...Object.values(NUM_RESIDENTIAL_UNITS))
      .required(),
    otherwise: Joi.forbidden()
  }),
  nonProfitDescription: Joi.string().when('financiallySupportedNonProfit', {
    is: YES_NO.YES,
    then: Joi.string().max(TEXT_MAX_LENGTH).required(),
    otherwise: Joi.forbidden()
  }),
  otherSelected: Joi.boolean().allow(null),
  otherUnits: Joi.string().when('otherSelected', {
    is: Joi.exist(),
    then: Joi.string()
      .valid(...Object.values(NUM_RESIDENTIAL_UNITS))
      .required(),
    otherwise: Joi.forbidden()
  }),
  otherUnitsDescription: Joi.when('otherSelected', {
    is: Joi.exist(),
    then: Joi.string().trim().max(TEXT_MAX_LENGTH).required(),
    otherwise: Joi.forbidden()
  }),
  projectName: Joi.string().max(TEXT_MAX_LENGTH).required(),
  projectDescription: Joi.string().max(TEXT_MAX_LENGTH).allow(null),
  rentalUnits: Joi.string().when('hasRentalUnits', {
    is: YES_NO.YES,
    then: Joi.string()
      .valid(...Object.values(NUM_RESIDENTIAL_UNITS))
      .required(),
    otherwise: Joi.forbidden()
  }),
  singleFamilySelected: Joi.boolean().allow(null),
  singleFamilyUnits: Joi.string().when('singleFamilySelected', {
    is: Joi.exist(),
    then: Joi.string()
      .valid(...Object.values(NUM_RESIDENTIAL_UNITS))
      .required(),
    otherwise: Joi.forbidden()
  })
}).xor('singleFamilySelected', 'multiFamilySelected', 'otherSelected');

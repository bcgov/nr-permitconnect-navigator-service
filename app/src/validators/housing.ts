import Joi from 'joi';
import { YES_NO_UNSURE_LIST } from '../utils/constants/application';
import { BasicResponse } from '../utils/enums/application';
import { NUM_RESIDENTIAL_UNITS_LIST } from '../utils/constants/housing';

export const housing = Joi.object({
  financiallySupportedBC: Joi.string()
    .required()
    .valid(...YES_NO_UNSURE_LIST),
  financiallySupportedIndigenous: Joi.string()
    .required()
    .valid(...YES_NO_UNSURE_LIST),
  financiallySupportedNonProfit: Joi.string()
    .required()
    .valid(...YES_NO_UNSURE_LIST),
  financiallySupportedHousingCoop: Joi.string()
    .required()
    .valid(...YES_NO_UNSURE_LIST),
  hasRentalUnits: Joi.string()
    .required()
    .valid(...YES_NO_UNSURE_LIST),
  housingCoopDescription: Joi.when('financiallySupportedHousingCoop', {
    is: BasicResponse.YES,
    then: Joi.string().required().max(255).trim(),
    otherwise: Joi.forbidden()
  }),
  indigenousDescription: Joi.when('financiallySupportedIndigenous', {
    is: BasicResponse.YES,
    then: Joi.string().required().max(255).trim(),
    otherwise: Joi.forbidden()
  }),
  multiFamilySelected: Joi.boolean().allow(null),
  multiFamilyUnits: Joi.when('multiFamilySelected', {
    is: true,
    then: Joi.string()
      .valid(...NUM_RESIDENTIAL_UNITS_LIST)
      .required(),
    otherwise: Joi.forbidden()
  }),
  nonProfitDescription: Joi.when('financiallySupportedNonProfit', {
    is: BasicResponse.YES,
    then: Joi.string().required().max(255).trim(),
    otherwise: Joi.forbidden()
  }),
  otherSelected: Joi.boolean().allow(null),
  otherUnits: Joi.when('otherSelected', {
    is: true,
    then: Joi.string()
      .valid(...NUM_RESIDENTIAL_UNITS_LIST)
      .required(),
    otherwise: Joi.forbidden()
  }),
  otherUnitsDescription: Joi.when('otherSelected', {
    is: true,
    then: Joi.string().required().max(255).trim(),
    otherwise: Joi.forbidden()
  }),
  projectName: Joi.string().required().max(255).trim(),
  projectDescription: Joi.string().max(4000).allow(null),
  rentalUnits: Joi.when('hasRentalUnits', {
    is: BasicResponse.YES,
    then: Joi.string()
      .valid(...NUM_RESIDENTIAL_UNITS_LIST)
      .required(),
    otherwise: Joi.forbidden()
  }),
  singleFamilySelected: Joi.boolean().allow(null),
  singleFamilyUnits: Joi.when('singleFamilySelected', {
    is: true,
    then: Joi.string()
      .valid(...NUM_RESIDENTIAL_UNITS_LIST)
      .required(),
    otherwise: Joi.forbidden()
  })
}).or('singleFamilySelected', 'multiFamilySelected', 'otherSelected');

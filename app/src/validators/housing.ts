import Joi from 'joi';

import { NUM_RESIDENTIAL_UNITS, TEXT_MAX_LENGTH, YES_NO } from '../components/constants';
import { stringRequiredMaxLengthTrim, stringRequiredYesNoUnsure } from './common';

const stringRequiredNumResidentialUnits = Joi.string()
  .valid(...Object.values(NUM_RESIDENTIAL_UNITS))
  .required();

export const housingSchema = Joi.object({
  financiallySupportedBC: stringRequiredYesNoUnsure,
  financiallySupportedIndigenous: stringRequiredYesNoUnsure,
  financiallySupportedNonProfit: stringRequiredYesNoUnsure,
  financiallySupportedHousingCoop: stringRequiredYesNoUnsure,
  hasRentalUnits: stringRequiredYesNoUnsure,
  housingCoopDescription: Joi.when('financiallySupportedHousingCoop', {
    is: YES_NO.YES,
    then: stringRequiredMaxLengthTrim,
    otherwise: Joi.forbidden()
  }),
  indigenousDescription: Joi.when('financiallySupportedIndigenous', {
    is: YES_NO.YES,
    then: stringRequiredMaxLengthTrim,
    otherwise: Joi.forbidden()
  }),
  multiFamilySelected: Joi.boolean().allow(null),
  multiFamilyUnits: Joi.when('multiFamilySelected', {
    is: true,
    then: stringRequiredNumResidentialUnits,
    otherwise: Joi.forbidden()
  }),
  nonProfitDescription: Joi.when('financiallySupportedNonProfit', {
    is: YES_NO.YES,
    then: stringRequiredMaxLengthTrim,
    otherwise: Joi.forbidden()
  }),
  otherSelected: Joi.boolean().allow(null),
  otherUnits: Joi.when('otherSelected', {
    is: true,
    then: stringRequiredNumResidentialUnits,
    otherwise: Joi.forbidden()
  }),
  otherUnitsDescription: Joi.when('otherSelected', {
    is: Joi.exist(),
    then: stringRequiredMaxLengthTrim,
    otherwise: Joi.forbidden()
  }),
  projectName: stringRequiredMaxLengthTrim,
  projectDescription: Joi.string().max(TEXT_MAX_LENGTH).allow(null),
  rentalUnits: Joi.when('hasRentalUnits', {
    is: YES_NO.YES,
    then: stringRequiredNumResidentialUnits,
    otherwise: Joi.forbidden()
  }),
  singleFamilySelected: Joi.boolean().allow(null),
  singleFamilyUnits: Joi.when('singleFamilySelected', {
    is: true,
    then: stringRequiredNumResidentialUnits,
    otherwise: Joi.forbidden()
  })
}).or('singleFamilySelected', 'multiFamilySelected', 'otherSelected');
